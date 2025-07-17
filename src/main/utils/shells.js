/*
 * @Author: 羊驼
 * @Date: 2025-06-23 09:03:57
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-17 15:44:28
 * @Description: 终端管理类
 */

import { app } from 'electron'

import { spawn } from "node:child_process"
import pidusage from "pidusage"
import moment from "moment"
import treeKill from "tree-kill"
import Config from '../config';
import Database from '../database'
import common from '@resources/js/common'
import pidtree from 'pidtree'
const STATUS = common.STATUS

// 简易日志 本来想用winston 后续发现没必要一直写入 我就看最新的
class Logger {
    store = []
    max = 500
    constructor(max) {
        this.max = max
    }
    info(msg) {
        this.message('info', msg)
    }

    error(msg) {
        this.message('error', msg)
    }

    message(level, msg) {
        if (this.store.length >= this.max) {
            this.store.shift()
        }
        this.store.push({ content: `${moment().format("MM-DD HH:mm:ss")}：${msg}`, type: level })
    }
    read() {
        return this.store
    }
}


/**
 * @description: 终端管理器 (代码量不多 没必要二次封装Shell子项)
 * @return {*}
 */
export default class ShellManager {
    // 单例
    static _instance = null
    static getInstance() {
        if (!this._instance) {
            this._instance = new ShellManager()
        }
        return this._instance
    }
    // 任务存储
    task = {}
    // 数据库
    database = Database.getInstance()

    constructor() {
        this.InitShells()
        // 检测程序退出
        process.on("beforeExit", () => {
            console.log("beforeExit");
            this.killAllRunner()
        })
        // 检测程序退出
        app.once("before-quit", () => {
            console.log("before-quit");
            this.killAllRunner()
        })
    }

    /**
    * @description: 清空脚本
    */
    async clearRunner() {
        for (let shell in this.task) {
            let item = this.task[shell]
            await this.Stop(item)
            delete this.task[shell]
        }
    }

    /**
     * @description: 取消所有子进程的监听
     */
    async killAllRunner() {
        console.log("kill-child-process", new Date().getTime())
        for (let shell in this.task) {
            let item = this.task[shell]
            await this.Stop(item)
        }
        process.removeAllListeners()
        process.exit(0)

    }

    /**
     * @description: 初始化启动项
     */
    async InitShells() {
        let { Shell } = this.database.getModels()
        let shells = await Shell.findAll({
            order: [["order", "asc"]],
            raw: true
        })
        // 从配置中读取
        let config = Config.getConfig()
        let task = this.task
        let ids = new Set(shells.map((x) => x.id))
        // 清理被删除或者意外不在列表的数据
        for (let id in this.task) {
            let item = this.task[id]
            if (!ids.has(id)) {
                item.runner && await this.Stop(id)
                delete task[id]
            }
        }
        this.StartShells(shells, config)

    }

    /**
     * @description: 批量启动
     */
    StartShells(shells, config) {
        let task = this.task
        let { order, immediately, terminal } = config
        // console.log(shells, config);
        let startPromise = []
        // 初始化数据
        for (let item of shells) {
            task[item.id] = {
                ...item,
                status: STATUS.未启动,
                memory: 0,
                runner: null,
                logs: [],
                showLog: terminal,
            }
            item.enable && immediately && startPromise.push(this.ProcessHandler(item.id))
        }
        if (!immediately) return
        if (order) {
            startPromise.reduce((prevPromise, currentPromise) => {
                return prevPromise.then(() => currentPromise && currentPromise());
            }, Promise.resolve()).then(() => {
                console.log('顺序执行启动项');
            }).catch((err) => {
                this.CreateErrorLog(err)

            });
        } else {
            Promise.race(startPromise).catch((err) => {
                this.CreateErrorLog(err)
            })
        }
    }

    /**
     * @description: 创建错误日志
     */
    CreateErrorLog(err, id) {
        let { Logs } = this.database.getModels()
        console.log(err);
        Logs.create({
            shell_id: id,
            type: "启动项运行发生错误",
            level: "错误",
            content: err.message
        })
    }

    /**
    * @description: 启动处理
    */
    ProcessHandler(key) {
        let task = this.task
        return new Promise((resolve, reject) => {
            let item = task[key]
            item.runner = this.GetRunner(item)
            if (!item.runner) return
            let runner = item.runner

            const logger = new Logger(500)

            // 获取内存使用情况
            let interval = setInterval(async () => {
                if (runner.killed) {
                    clearInterval(interval)
                }
                // console.log("使用内存：" , process.memoryUsage());
                let promise = []
                try {
                    // 新增 处理存在子进程的问题
                    let tree = await pidtree(runner.pid, { advanced: false });
                    for (let item of tree) {
                        promise.push(new Promise((resolve, reject) => {
                            pidusage(item, (err, stats) => {
                                if (err) {
                                    console.error('获取内存使用情况时出错:', err);
                                    resolve(0)
                                    return;
                                }
                                resolve(stats.memory)
                            });
                        }))
                    }
                } catch (err) {
                    console.error('获取内存使用情况时出错:', err);
                }
                pidusage(runner.pid, async (err, stats) => {
                    if (err) {
                        item.status = "已停止"
                        console.error('获取内存使用情况时出错:', err);
                        clearInterval(interval)
                        item.memory = 0
                        return;
                    }
                    // console.log(stats)
                    // item.memory = stats.memory
                    await Promise.all(promise).then((res) => {
                        item.memory = res.reduce((a, b) => a + b, 0) + stats.memory
                    })
                    // console.log(`子进程的内存使用情况: ${JSON.stringify(stats)}`);
                });

            }, 2000);


            let interval2 = setInterval(() => {
                const logs = logger.read();
                if (logs.length) {
                    item.logs = logs
                }
            }, 1000);


            runner.on("error", (err) => {
                console.log(`runner error：${err.message}`);
                logger.error(err.message)
                clearInterval(interval)
                clearInterval(interval2)
                this.CreateErrorLog(err, item.id)
                this.Stop(item.id)

            })

            let timer = null
            runner.on("spawn", () => {
                item.status = STATUS.启动中
                timer = setTimeout(() => {
                    item.status = STATUS.运行中
                }, 2000)
            })

            runner.stdout.on("data", (data) => {
                item.status = STATUS.运行中
                logger.info(data.toString())
            })
            runner.stderr.on("data", (data) => {
                // console.log(`runner stderr error:${data.toString()}`)
                logger.error(data.toString())
            })

            runner.on("exit", () => {
                clearTimeout(timer)
                item.status = STATUS.已退出
                item.memory = 0
                clearInterval(interval)
                clearInterval(interval2)
                console.log("runner exit")
                // logger.close()
            })

            resolve()
        })
    }
    /**
    * @description: 获取spawn对象
    */
    GetRunner(item) {
        let suffix = item.path.substring(item.path.lastIndexOf('.'))
        let cwd = item.path.substring(0, item.path.lastIndexOf('\\'))
        let options = { encoding: "utf-8", windowsHide: true, cwd }
        switch (suffix) {
            case ".js":
                return spawn('node', [item.path], options)
            case ".exe":
                return spawn(item.path, options)
            case ".bat":
            case ".cmd":
                return spawn('cmd.exe', ['/c', item.path], options)
            case ".ps1":
                return spawn('powershell.exe', ['-File', item.path], options)
        }
        return null
    }


    /**
    * @description: 获取任务列表
    */
    GetTask(shells) {
        // console.log(this.task)
        return shells.map(({ id, name, path, order, enable }) => {
            let task = this.task[id]
            // console.log(task && task.status)
            return {
                id,
                name,
                path,
                status: (task && task.status) || STATUS.未启动,
                memory: (task && task.memory && parseInt(task.memory / 1024 / 1024)) || 0,
                action: '',
                order,
                enable: enable ? true : false,
                logs: task && task.logs || [],
                showLog: task && task.showLog || false,
            }
        })

    }
    /**
     * @description: 启动
     */
    Start(id) {
        this.ProcessHandler(id)
    }

    /**
    * @description: 停止
    */
    async Stop(id) {
        let item = this.task[id]
        if (!item.runner) return
        let tree = await pidtree(item.runner.pid, { advanced: false });
        console.log(tree);
        tree.forEach((pid) => {
            treeKill(pid, 'SIGTERM')
        })
        item.runner.removeAllListeners()
        treeKill(item.runner.pid, 'SIGTERM')
        item.status = STATUS.已退出
        item.runner = null
        item.memory = 0

    }

    // /**
    // * @description: 设置控制台日志是否显示
    // */
    // SetLogShow(id, flag) {
    //     let item = this.task[id]
    //     if (item) {
    //         item.showLog = flag
    //     }
    // }

}