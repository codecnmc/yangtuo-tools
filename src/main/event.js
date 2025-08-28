/*
 * @Author: 羊驼
 * @Date: 2025-06-17 09:45:15
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 16:27:20
 * @Description: 事件中心
 */
import { app, ipcMain, dialog } from 'electron'
import Config from './config'
import Database from './database';
import Application from './utils/application';
import api from '@resources/js/api';
import DataListener from './listener';
import PluginLoader from './utils/loader';
import Sequelize from 'sequelize';

/**
 * @description:功能处理中心
 */
export default class EventCenter {

    window = Application.window
    database = Database.getInstance()
    loader = new PluginLoader()

    /**
     * @description: 事件处理
     */
    constructor() {
        let events = {
            ...this.systemEvent(),
            ...this.toolsEvent(),
            ...this.searchEvent()
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
    systemEvent() {
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
            [api.SYSTEM.GET_OPEN_DIALOG]: (event, options) => {
                return dialog.showOpenDialog(options)
            },
            // 获取版本
            [api.SYSTEM.GET_VERSION]: () => {
                return app.getVersion()
            },
            // 获取配置
            [api.SYSTEM.GET_CONFIG]: () => {
                return Config.getConfig()
            },
            // 设置配置
            [api.SYSTEM.SET_CONFIG]: (event, config) => {
                if (typeof (config) != "object") return
                let source_lang = Config.getConfig().lang
                Config.setConfig(config)
                if (source_lang != config.lang) {
                    // 语言改变了
                    for (let key in global.SHARE.language) {
                        let item = global.SHARE.language[key]
                        if (item) {
                            item.forEach(callback => {
                                callback(config.lang)
                            })
                        }
                    }
                }
                DataListener.broadcast(api.UPDATE.CONFIG)
            },
            // 数据清空
            [api.SYSTEM.CLEAR_DATA]: async (event) => {
                this.loader.uninstallAll()
                await this.database.clearData()
                // 重启eletron
                app.relaunch()
                app.exit()
            },
            // 恢复默认配置
            [api.SYSTEM.CONFIG_RESTORE]: (event) => {
                let config = JSON.parse(JSON.stringify(Config.DEFAULT_CONFIG))
                Config.setConfig(config)
                DataListener.broadcast(api.UPDATE.CONFIG)
                Config.setWindowPosition(Config.WINDOW_ENUM.MAIN, true, false)
            },
            // 获取语言列表
            [api.SYSTEM.GET_LANG_LIST]: () => {
                return Config.messages
            },
        }
    }



    /**
    * @description: 插件工具
    */
    toolsEvent() {
        let loader = this.loader
        loader.setInject({
            database: {
                Sequelize,
                createDatabase(name, model, config) {
                    return Database.getInstance().getSequlize().define(name, model, config)
                },
                checkTableExist(name) {
                    return Database.getInstance().getSequlize().getQueryInterface().tableExists(name)
                }
            },
        })

        return {
            // 获取插件列表
            [api.TOOLS.GET_TOOLS_LIST]: async (event) => {
                let plugins = await loader.getPluginList()
                return this.createResponse(true, "", plugins)
            },
            // 设置插件配置
            [api.TOOLS.SETTING_TOOLS]: async (event, item, config) => {
                loader.setPluginSetting(item, config)
                return this.createResponse(true, "")
            },
            // 开发模式
            [api.TOOLS.TOOLS_DEV_START]: (event, rootPath) => {
                return loader.openDev(rootPath)
            },
            // 关闭开发模式
            [api.TOOLS.TOOLS_DEV_END]: (event) => {
                return loader.killDev()
            },
            [api.TOOLS.TOOLS_DEV_STATUS]: () => {
                return loader.DEV_PLUGINS
            },
            [api.TOOLS.TOOLS_GET_CSS]: () => {
                return this.loader.injectCSS()
            },
            [api.TOOLS.TOOLS_ADD]: (event) => {
                return loader.addPlugin()
            },
            [api.TOOLS.TOOLS_DELETE]: (event, item) => {
                return loader.deletePlugin(item)
            },

        }
    }

    //#endregion

    /**
    * @description: 搜索窗口事件
    */
    searchEvent() {
        return {
            [api.SEARCH.HIDE]: () => {
                Application.search.hide()
            },
            [api.SEARCH.SELECT]: async (event, item) => {
                let needLoading = false
                let devPlugin = this.loader.DEV_PLUGINS
                // 判断插件是否启用
                if ((!devPlugin && !item.enable) || (!item.enable && devPlugin.name != item.name)) {
                    // 插件未启用
                    this.loader.setPluginSetting(item, {
                        enable: true
                    })
                    this.loader.getPreload(item)
                    await this.loader.loadPlugin(item)
                    needLoading = true
                }
                let target = this.loader.PLUGINS[item.name]
                if (!target) {
                    return this.createResponse(false, "插件不存在")
                }
                let { x, y } = Application.search.getBounds()
                let needWindowFocus = true
                if (target.js && target.js.windowFocus !== undefined) {
                    needWindowFocus = target.js.windowFocus
                }
                const handleFocus = () => {
                    try {
                        // 判断类型
                        switch (item.type) {
                            case "view":
                                Application.window.webContents.send(api.SEARCH.FOCUS_VIEW, item.name)
                                target.js.focus && target.js.focus()
                                break;
                            case "window":
                                // 如果有自定义聚焦事件 就触发 没有就
                                if (!target.js.focus) {
                                    target.win.show()
                                    // 设置位置
                                    target.win.setPosition(x, y)
                                    target.win.center()
                                } else {
                                    target.js.focus()
                                }
                                break;
                        }
                        if (needWindowFocus) {
                            Application.window.show()
                        } else {
                            Application.window.hide()
                        }
                    } catch (err) {
                        if (devPlugin && devPlugin.name == item.name) {
                            this.loader.catchError(true, item.script, err)
                        } else {
                            dialog.showMessageBox({
                                type: "error",
                                title: item.name,
                                message: err.message,
                                detail: err.stack
                            })
                        }
                    }
                }
                if (needLoading) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            Application.search.hide()
                            handleFocus()
                            resolve()
                        }, 1500)
                    })
                }
                else {
                    handleFocus()
                    Application.search.hide()
                    Promise.resolve()
                }

            }

        }
    }

}