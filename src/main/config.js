/*
 * @Author: 羊驼
 * @Date: 2025-07-02 10:35:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 11:41:24
 * @Description: 配置
 */
import { globalShortcut, dialog, screen } from 'electron'
import fs from "node:fs"
import path from 'node:path'
import Application from "./utils/application"
import DesktopManager from './utils/desktop'
const CONFIG_PATH = path.join(__dirname, "../../resources/other/config.json").replace("app.asar", "app.asar.unpacked");

export default class Config {

    // 默认配置
    static DEFAULT_CONFIG = {
        "run": false,
        "order": true,
        "immediately": false,
        "windows": {
            "0":
            {
                "shortcut": "F6", "show": true,
                "display": 0, "record": true,
                "bounds": null
            },
            "1": { "shortcut": "F8", "show": false, "display": 0, "record": true, "bounds": null },
            "2": { "shortcut": "F7", "show": false, "display": 0, "record": true, "bounds": null }
        },
        "file_window_custom":
            { "glass": true, "pin": false, "layout": "横排" },
        "file_terminal_custom": {
            "pin": false,
        },
        "appearance": {
            "glass": true,
            "--main-background": "#666",
            "--background-color": "rgba(0, 0, 0, 0.2)",
            "--title-color": "rgba(0, 0, 0, 0.5)",
            "--font-color": "#ffffff",
            "--background-hover-color": "rgba(0, 0, 0, 0.2)",
            "--title-hover-color": "rgba(0, 0, 0, 0.5)",
            "--font-hover-color": "#ffffff",
            "--scroll-track": "rgba(209, 209, 209, 0.5)",
            "--scroll-thumb": "rgba(209, 209, 209, 1)",
            "--side-bar-background": "rgba(255, 255, 255, 0.3)",
            "--side-bar-color": "#000",
            "--side-bar-active-bg": "rgba(0, 0, 0, 0.3)",
            "--side-bar-acitve-color": "#fff",
            "--file-item-hover": "rgba(255, 255, 255, 0.2)",
            "--contextmenu-bg": "#fff",
            "--contextmenu-item-hover": "#eee",
            "--contextmenu-item-font": "#000",
            "--contextmenu-item-font-hover": "#000",
            "--drawer-bg": " rgba(255, 255, 255, 0.9)",
            "--drawer-font": " #000",
            "--console-bg": "#000",
            "--console-font": " #fff",
            "--console-scroll-bg": " #000",
            "--console-scroll-thumb": " #ccc",
            "--error-text": " red",
            "--console-border": " #ccc",
            "--console-title-bg": " #fff",
            "--console-title-font": " #000",
        },
        "IDE": {
            "vscode": ""
        }
    }

    // 窗口美剧
    static WINDOW_ENUM = {
        "MAIN": 0,
        "TERMINAL": 1,
        "FILE": 2,
    }


    static init() {
        !fs.existsSync(CONFIG_PATH) && fs.writeFileSync(CONFIG_PATH, JSON.stringify(Config.DEFAULT_CONFIG))
    }

    /**
     * @description: 获取配置
     * @return {Config.DEFAULT_CONFIG}
     */
    static getConfig() {
        return JSON.parse(fs.readFileSync(CONFIG_PATH).toString())
    }

    /**
    * @description: 设置配置
    * @return {*}
    */
    static setConfig(config) {
        // 差异化检测 用于替换数据
        let source = this.getConfig()
        for (let item of Object.values(this.WINDOW_ENUM)) {
            if (config.windows[item].display != source.windows[item].display) {
                let windowConfig = this.setWindowPosition(item, true, true)
                config.windows[item].bounds = windowConfig.windows[item].bounds
            }
        }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config))
    }

    /**
     * @description: 根据配置设置窗口位置与显示
     */
    static setWindowPosition(key, center = false, force = false) {
        let config = this.getConfig()
        let window = this.WINDOWS[key]
        // console.log(config.windows[key]);
        if (!window) return
        let { show, display: index, record, bounds: myBounds } = config.windows[key]
        let [x1, y1] = window.getSize()
        let display = screen.getAllDisplays()
        x1 /= 2
        y1 /= 2
        display = display[index || 0] || display[0]
        let { x, y, width, height } = display.bounds
        if (record && !force) {
            let bounds = myBounds
            if (!bounds) {
                bounds = window.getBounds()
                if (center) {
                    bounds.x = x + width / 2 - x1
                    bounds.y = y + height / 2 - y1
                }
                bounds.x = parseInt(bounds.x)
                bounds.y = parseInt(bounds.y)
                config.windows[key].bounds = bounds
                this.setConfig(config)
            }
            window.setBounds(config.windows[key].bounds)
        } else {
            // 不管在那块屏幕都居中
            let [cx, cy] = [x + width / 2 - x1, y + height / 2 - y1]
            let bounds = {
                x: center ? parseInt(cx) : parseInt(x),
                y: center ? parseInt(cy) : parseInt(y),
                width: myBounds.width,
                height: myBounds.height
            }
            center ? window.setBounds(bounds) : window.setBounds(bounds)
        }
        if (force) {
            config.windows[key].bounds = window.getBounds()
        }
        show && window.show()
        // console.log(show);
        return config
    }



    //#region 快捷键组测

    // 快捷键防抖
    static DEBOUNCE = {
        [Config.WINDOW_ENUM.MAIN]: null,
        [Config.WINDOW_ENUM.FILE]: null,
        [Config.WINDOW_ENUM.TERMINAL]: null
    }


    /**
     * @description: 注册快捷键
     */
    static shortcut(config, debug = true) {
        // 注册快捷键
        globalShortcut.unregisterAll()
        let showDialog = false
        let window = Application.window
        let deskManager = DesktopManager.getInstance()
        for (let key of Object.values(this.WINDOW_ENUM)) {
            let shorcut = config.windows[key].shortcut
            if (!shorcut) {
                config.windows[key].shortcut = ""
            } else {
                let success = globalShortcut.register(shorcut, () => {
                    if (this.DEBOUNCE[key]) {
                        return
                    }
                    this.DEBOUNCE[key] = true
                    setTimeout(() => {
                        this.DEBOUNCE[key] = false
                    }, 300)
                    // 显示隐藏处理
                    switch (key) {
                        case this.WINDOW_ENUM.MAIN:
                            if (window.isVisible()) {
                                window.hide()
                            } else {
                                window.show()
                            }
                            break;
                        case this.WINDOW_ENUM.FILE:
                            deskManager.fileWindowShow()
                            break;
                        case this.WINDOW_ENUM.TERMINAL:
                            deskManager.terminalWindowShow()
                            break;
                    }
                })
                if (!success) {
                    showDialog = true
                    config.windows[key].shortcut = ""
                }
            }
        }

        debug && showDialog && dialog.showMessageBoxSync(this.window, {
            message: "该快捷键已被占用",
            type: "warning",
            title: "提示"
        })

    }

    // 注册位置大小变动监听事件
    static RIGSTER = {
        [Config.WINDOW_ENUM.MAIN]: null,
        [Config.WINDOW_ENUM.FILE]: null,
        [Config.WINDOW_ENUM.TERMINAL]: null
    }

    // 窗口对象
    static WINDOWS = {
        [Config.WINDOW_ENUM.MAIN]: null,
        [Config.WINDOW_ENUM.FILE]: null,
        [Config.WINDOW_ENUM.TERMINAL]: null
    }

    /**
     * @description: 注册位置大小变动监听事件
     */
    static registerRecord(window, key) {
        let config = this.getConfig()
        this.WINDOWS[key] = window
        let record = config.windows[key].record
        this.RIGSTER[key] = () => {
            if (record && window.isMovable()) {
                config.windows[key].bounds = window.getBounds()
                this.setConfig(config)
            }
        }
        window.off("resized", this.RIGSTER[key])
        window.off("moved", this.RIGSTER[key])
        window.on("resized", this.RIGSTER[key])
        window.on("moved", this.RIGSTER[key])

    }
    //#endregion
}