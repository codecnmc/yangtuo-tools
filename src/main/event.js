/*
 * @Author: 羊驼
 * @Date: 2025-06-17 09:45:15
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 16:47:56
 * @Description: 事件中心
 */
import { app, shell, ipcMain, dialog, screen } from 'electron'
import { fn, col } from 'sequelize';
import fs from "node:fs"
import ShellManager from './utils/shells';
import Config from './config'
import Database from './database';
import Application from './utils/application';
import DesktopManager from './utils/desktop';
import api from '@resources/js/api';
import DataListener from './listener';
import normal_bg from "@resources/pictures/apex.png?asset&asarUnpack"
import bg from "@resources/pictures/bg.png?asset&asarUnpack"
import { exec } from 'node:child_process';
/**
 * @description:功能处理中心
 */
export default class EventCenter {

    window = Application.window
    database = Database.getInstance()
    shellManager = ShellManager.getInstance()

    /**
     * @description: 事件处理
     */
    constructor() {
        let events = {
            ...this.SystemEvent(),
            ...this.ShellEvent(),
            ...this.FileEvent(),
            ...this.LogEvent(),
        }
        for (let kv in events) {
            ipcMain.handle(kv, events[kv]);
        }
    }

    //#region  handle处理


    /**
     * @description: 回应前端处理
     * @param {Boolean} status
     * @param {String} message
     * @param {any} data
     */
    createResponse(status, message, data) {
        return { status, message, data }
    }

    /**
     * @description: 系统事件
     * @return {*}
     */
    SystemEvent() {
        let window = this.window
        return {
            // 关闭窗口
            [api.SYSTEM.CLOSE]: () => {
                app.quit();
            },
            // 全屏
            [api.SYSTEM.FULLSCREEN]: () => {
                window.setFullScreen(!window.isFullScreen());
            },
            // 最小化
            [api.SYSTEM.MINIMIZE]: () => {
                window.minimize();
            },
            // 打开文件选择弹窗
            [api.SYSTEM.GET_OPEN_DIALOG]: (event, config) => {
                return dialog.showOpenDialog(window, config)
            },
            // 获取文件夹情况
            [api.SYSTEM.GET_FILE_DATA]: (event, path) => {
                return fs.readdirSync(path)
            },
            [api.SYSTEM.GET_FOLDER_FILE_LIST]: (event, path, type) => {
                let fileBuffer = fs.readFileSync(path)
                return fileBuffer.toString(type)
            },
            // 获取配置
            [api.SYSTEM.GET_CONFIG]: () => {
                return Config.getConfig()
            },
            // 设置配置
            [api.SYSTEM.SET_CONFIG]: (event, config) => {
                if (typeof (config) != "object") return
                Config.shortcut(config, true)
                Config.setConfig(config)
                DataListener.broadcast(api.UPDATE.CONFIG)
            },
            // 获取显示器信息
            [api.SYSTEM.GET_MONITOR_INFO]: () => {
                return screen.getAllDisplays()
            },
            // 数据清空
            [api.SYSTEM.CLEAR_DATA]: async (event) => {
                await this.shellManager.clearRunner()
                await this.database.clearData()
                DataListener.broadcast(api.UPDATE.SHELL)
                DataListener.broadcast(api.UPDATE.FILE)
            },
            // 恢复默认配置
            [api.SYSTEM.CONFIG_RESTORE]: (event) => {
                let config = JSON.parse(JSON.stringify(Config.DEFAULT_CONFIG))
                Config.shortcut(config, true)
                Config.setConfig(config)
                DataListener.broadcast(api.UPDATE.CONFIG)
                Config.setWindowPosition(Config.WINDOW_ENUM.MAIN, true, false)
                Config.setWindowPosition(Config.WINDOW_ENUM.FILE, true, false)
                Config.setWindowPosition(Config.WINDOW_ENUM.TERMINAL, true, false)
                Config.WINDOWS[Config.WINDOW_ENUM.FILE] && DesktopManager.getInstance().checkPin(Config.WINDOWS[Config.WINDOW_ENUM.FILE], false)
                Config.WINDOWS[Config.WINDOW_ENUM.TERMINAL] && DesktopManager.getInstance().checkPin(Config.WINDOWS[Config.WINDOW_ENUM.TERMINAL], false)
                fs.copyFileSync(normal_bg, bg)
                DataListener.broadcast(api.UPDATE.BACKGROUND)
            },
            // 设置背景图
            [api.SYSTEM.CHANGE_BACKGROUND]: (event, path) => {
                // 图片覆盖
                fs.copyFileSync(path, bg)
                DataListener.broadcast(api.UPDATE.BACKGROUND)
            }
        }
    }



    /**
     * @description: 终端功能事件处理
     */
    ShellEvent() {
        let { Shell, Logs } = this.database.getModels()
        return {
            // 获取启动项列表
            [api.SHELL.GET_SHELL_LIST]: async () => {
                let data = await Shell.findAll({ order: [["order", "asc"]], raw: true })
                return this.createResponse(true, "获取列表成功", this.shellManager.GetTask(data))
            },
            // 创建启动项
            [api.SHELL.CREATE_SHELL]: async (event, list, setting) => {
                let order = await Shell.findOne({ attributes: [[fn("max", col("order")), "max"]], raw: true })
                order = order && order.max || 1
                list = list.map((x) => {
                    return {
                        ...x,
                        order: order++
                    }
                })
                return await Shell.bulkCreate(list).then((target) => {
                    this.shellManager.StartShells(JSON.parse(JSON.stringify(target)), setting)
                    DataListener.broadcast(api.UPDATE.SHELL)
                    return this.createResponse(true, "创建成功")
                }).catch((err) => {
                    console.log(err);
                    Logs.create({ type: "启动项创建失败", level: "错误", content: err.message })
                    return this.createResponse(false, "创建失败")
                })
            },
            // 修改启动项
            [api.SHELL.EDIT_SHELL]: async (event, list, setting) => {
                // console.log(list);
                return await Shell.bulkCreate(list, {
                    updateOnDuplicate: ["id", "name", "path", "order", "enable"],
                    // fields: []
                }).then((target) => {
                    // console.log(target);
                    DataListener.broadcast(api.UPDATE.SHELL)
                    this.shellManager.StartShells(JSON.parse(JSON.stringify(target)), setting)
                    return this.createResponse(true, "修改成功")
                }).catch((err) => {
                    console.log(err);
                    Logs.create({ type: "启动项修改失败", level: "错误", content: err.message })
                    return this.createResponse(false, "修改失败")
                })
            },
            // 删除启动项
            [api.SHELL.DELETE_SHELL]: async (event, id) => {
                return await Shell.destroy({ where: { id } }).then(() => {
                    return this.createResponse(true, "删除成功")
                }).catch((err) => {
                    console.log(err);
                    DataListener.broadcast(api.UPDATE.SHELL)
                    this.shellManager.InitShells()
                    Logs.create({ type: "启动项删除失败", level: "错误", content: err.message })
                    return this.createResponse(false, "删除失败")
                })
            },
            // 启动终端
            [api.SHELL.START_SHELL]: async (event, id) => {
                return this.shellManager.Start(id)
            },
            // 关闭终端
            [api.SHELL.STOP_SHELL]: async (event, id) => {
                return this.shellManager.Stop(id)
            },
            // 打开脚本控制台
            [api.SHELL.OPEN_SHELL_WINDOW]: (event) => {
                DesktopManager.getInstance().terminalWindowShow()
            }
        }
    }


    /**
     * @description: 快捷文件功能事件处理
     */
    FileEvent() {
        let { Files, Logs } = this.database.getModels()
        return {
            // 用IDE打开目录
            [api.FILE.OPEN_IDE]: (event, path) => {
                console.log(path);
                exec(path);
            },
            // 打开文件
            [api.FILE.OPEN_FILE]: (event, item) => {
                shell.openPath(item.path)
            },
            // 获取文件列表
            [api.FILE.GET_FILE_LIST]: async () => {
                let data = await Files.findAll({ raw: true, order: [["updatedAt", "desc"], ["order", "asc"]] })
                return this.createResponse(true, "获取文件列表成功", data)
            },
            // 创建文件列表
            [api.FILE.CREATE_FILES]: async (event, files) => {
                let order = await Files.findAll({ attributes: [[fn("max", col("order")), "max"], "group"], group: ["group"], raw: true })
                order = order.reduce((pre, cur) => {
                    pre[cur.group] = cur.max
                    return pre
                }, {})
                files = files.map((x) => {
                    if (order[x.group]) {
                        x.order = order[x.group]++
                    } else {
                        x.order = 0
                    }
                    return x
                })
                return await Files.bulkCreate(files).then((target) => {
                    DataListener.broadcast(api.UPDATE.FILE)
                    return this.createResponse(true, "创建成功")
                }).catch((err) => {
                    console.log(err);
                    Logs.create({ type: "快捷文件创建失败", level: "错误", content: err.message })
                    return this.createResponse(false, "创建失败")
                })
            },
            // 修改快捷文件
            [api.FILE.EDIT_FILES]: async (event, files) => {
                // console.log(list);
                return await Files.bulkCreate(files, {
                    updateOnDuplicate: ["id", "name", "path", "type", "icon", "custom_icon", "group", "order"],
                    // fields: []
                }).then((target) => {
                    DataListener.broadcast(api.UPDATE.FILE)
                    return this.createResponse(true, "修改成功")
                }).catch((err) => {
                    console.log(err);
                    Logs.create({ type: "快捷文件修改失败", level: "错误", content: err.message })
                    return this.createResponse(false, "修改失败")
                })
            },
            // 删除文件列表
            [api.FILE.DELETE_FILES]: async (event, id) => {
                return await Files.destroy({ where: { id } }).then(() => {
                    DataListener.broadcast(api.UPDATE.FILE)
                    return this.createResponse(true, "删除成功")
                }).catch((err) => {
                    console.log(err);
                    Logs.create({ type: "快捷文件删除失败", level: "错误", content: err.message })
                    return this.createResponse(false, "删除失败")
                })
            },
            // 打开快捷文件窗口
            [api.FILE.OPEN_FILE_WINDOW]: (event) => {
                DesktopManager.getInstance().fileWindowShow()
            }

        }
    }

    /**
   * @description: 日志
   */
    LogEvent() {
        let { Logs } = this.database.getModels()
        return {
            [api.LOG.GET_LOG_LIST]: async (event, filter) => {
                let { current_page, page_size } = filter
                let data = await Logs.findAndCountAll({
                    limit: page_size,
                    offset: (current_page - 1) * page_size,
                    raw: true,
                    order: [["createdAt", "desc"]]
                })
                return this.createResponse(true, "获取日志列表成功", data)
            },
        }
    }

    //#endregion
}