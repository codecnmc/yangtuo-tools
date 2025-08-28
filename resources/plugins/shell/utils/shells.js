/// <reference path="../types/index.d.ts"/>

let app = electron.app;
import { spawn } from "node:child_process";
import pidusage from "pidusage";
import treeKill from "tree-kill";
import pidtree from "pidtree";
import common from "./common/common.js";
import api from "./common/api.js";
import fs from "node:fs";
const STATUS = common.STATUS;
// 简易日志 本来想用winston 后续发现没必要一直写入 我就看最新的
/**
 * @description: 终端管理器 (代码量不多 没必要二次封装Shell子项)
 * @return {*}
 */
export default class ShellManager {
  // 模型数据
  Shell = null;
  // 任务存储
  task = {};
  // 获取窗口
  getWindow = null;
  /**
   * @description:
   * @param {*} Shell
   * @return {*}
   */
  constructor(Shell, getWindow) {
    this.Shell = Shell;
    this.getWindow = getWindow;
    this.InitShells();
    // 检测程序退出
    process.on("beforeExit", () => {
      console.log("beforeExit");
      this.killAllRunner();
    });
    // 检测程序退出
    app.once("before-quit", () => {
      console.log("before-quit");
      this.killAllRunner();
    });
  }

  /**
   * @description: 清空脚本
   */
  async clearRunner() {
    for (let shell in this.task) {
      let item = this.task[shell];
      await this.Stop(item);
      delete this.task[shell];
    }
  }

  /**
   * @description: 取消所有子进程的监听
   */
  async killAllRunner() {
    console.log("kill-child-process", new Date().getTime());
    for (let shell in this.task) {
      let item = this.task[shell];
      await this.Stop(item);
    }
  }

  getConfig() {
    return JSON.parse(fs.readFileSync(__dirname + "/config.json").toString());
  }

  /**
   * @description: 初始化启动项
   */
  async InitShells() {
    let { Shell } = this;
    let shells = await Shell.findAll({
      order: [["order", "asc"]],
      raw: true,
    });
    // 从配置中读取
    let config = this.getConfig();
    let task = this.task;
    let ids = new Set(shells.map((x) => x.id));
    // 清理被删除或者意外不在列表的数据
    for (let id in this.task) {
      let item = this.task[id];
      if (!ids.has(id)) {
        item.runner && (await this.Stop(id));
        delete task[id];
      }
    }
    this.StartShells(shells, config);
  }

  /**
   * @description: 批量启动
   */
  StartShells(shells, config) {
    let task = this.task;
    let { order, immediately, terminal } = config;
    // console.log(shells, config);
    let startPromise = [];
    // 初始化数据
    for (let item of shells) {
      task[item.id] = {
        ...item,
        status: STATUS.未启动,
        memory: 0,
        runner: null,
        logs: [],
        showLog: terminal,
      };
      item.enable && immediately && startPromise.push(this.ProcessHandler(item.id));
    }
    if (!immediately) return;
    if (order) {
      startPromise
        .reduce((prevPromise, currentPromise) => {
          return prevPromise.then(() => currentPromise && currentPromise());
        }, Promise.resolve())
        .then(() => {
          console.log("顺序执行启动项");
        })
        .catch((err) => {
          this.CreateErrorLog(err);
        });
    } else {
      Promise.race(startPromise).catch((err) => {
        this.CreateErrorLog(err);
      });
    }
  }

  /**
   * @description: 创建错误日志
   */
  CreateErrorLog(err, id) {
    Console.log(err);
  }

  /**
   * @description: 启动处理
   */
  ProcessHandler(key) {
    let task = this.task;
    return new Promise((resolve, reject) => {
      let item = task[key];
      item.runner = this.GetRunner(item);
      if (!item.runner) return;
      let runner = item.runner;
      // 获取内存使用情况
      let interval = setInterval(async () => {
        if (runner.killed) {
          clearInterval(interval);
        }
        // console.log("使用内存：" , process.memoryUsage());
        let promise = [];
        try {
          // 新增 处理存在子进程的问题
          let tree = await pidtree(runner.pid, { advanced: false });
          for (let item of tree) {
            promise.push(
              new Promise((resolve, reject) => {
                pidusage(item, (err, stats) => {
                  if (err) {
                    console.error("获取内存使用情况时出错:", err);
                    resolve(0);
                    return;
                  }
                  resolve(stats.memory);
                });
              })
            );
          }
        } catch (err) {
          console.error("获取内存使用情况时出错:", err);
        }
        pidusage(runner.pid, async (err, stats) => {
          if (err) {
            item.status = "已停止";
            // console.error("获取内存使用情况时出错:", err);
            clearInterval(interval);
            item.memory = 0;
            return;
          }
          await Promise.all(promise).then((res) => {
            item.memory = res.reduce((a, b) => a + b, 0) + stats.memory;
          });
        });
      }, 2000);

      runner.on("error", (err) => {
        console.log(`runner error：${err.message}`);
        logger.error(err.message);
        clearInterval(interval);
        this.CreateErrorLog(err, item.id);
        this.Stop(item.id);
      });

      let timer = null;
      runner.on("spawn", () => {
        item.status = STATUS.启动中;
        timer = setTimeout(() => {
          item.status = STATUS.运行中;
        }, 2000);
      });

      runner.stdout.on("data", (data) => {
        item.status = STATUS.运行中;
        let window = this.getWindow();
        window && window.webContents.send(api.SHELL.LOG, { id: item.id, log: data.toString() });
      });
      runner.stderr.on("data", (data) => {
        let window = this.getWindow();
        window && window.webContents.send(api.SHELL.LOG, { id: item.id, log: "\x1B[1;31m" + data.toString() + "\x1B[0m" });
      });

      runner.on("exit", () => {
        clearTimeout(timer);
        item.status = STATUS.已退出;
        item.memory = 0;
        clearInterval(interval);
        console.log("runner exit");
      });

      resolve();
    });
  }
  /**
   * @description: 获取spawn对象
   */
  GetRunner(item) {
    let suffix = item.path.substring(item.path.lastIndexOf("."));
    let cwd = item.path.substring(0, item.path.lastIndexOf("\\"));
    let options = { encoding: "utf-8", windowsHide: true, cwd };

    switch (suffix) {
      case ".js":
        return spawn("node", [item.path], options);
      case ".exe":
        return spawn(item.path, options);
      case ".bat":
      case ".cmd":
        return spawn("cmd.exe", ["/c", item.path], options);
      case ".ps1":
        return spawn("powershell.exe", ["-File", item.path], options);
    }
    return null;
  }

  /**
   * @description: 获取任务列表
   */
  GetTask(shells) {
    // console.log(this.task)
    return shells.map(({ id, name, path, order, enable }) => {
      let task = this.task[id];
      return {
        id,
        name,
        path,
        status: (task && task.status) || STATUS.未启动,
        memory: (task && task.memory && parseInt(task.memory / 1024 / 1024)) || 0,
        action: "",
        order,
        enable: enable ? true : false,
        showLog: (task && task.showLog) || false,
      };
    });
  }
  /**
   * @description: 启动
   */
  Start(id) {
    this.ProcessHandler(id);
  }

  /**
   * @description: 停止
   */
  async Stop(id) {
    let item = this.task[id];
    if (!item.runner) return;
    let tree = await pidtree(item.runner.pid, { advanced: false });
    tree.forEach((pid) => {
      treeKill(pid, "SIGTERM");
    });
    item.runner.removeAllListeners();
    treeKill(item.runner.pid, "SIGTERM");
    item.status = STATUS.已退出;
    item.runner = null;
    item.memory = 0;
    item.logs = [];
  }
}
