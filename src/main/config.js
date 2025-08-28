/*
 * @Author: 羊驼
 * @Date: 2025-07-02 10:35:35
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 13:52:59
 * @Description: 配置
 */
import { screen, dialog, globalShortcut } from 'electron'
import fs from "node:fs"
import path from 'node:path'
const CONFIG_PATH = path.join(__dirname, "../../resources/other/config.json").replace("app.asar", "app.asar.unpacked");
export default class Config {

    // 默认配置
    static DEFAULT_CONFIG = {
        "run": false,
        "lang": "zh-CN",
        "windows": {
            "0": {
                "shortcut": "F6",
                "show": true,
                "record": true,
                "bounds": null
            },
            "1": {
                "shortcut": "shift+space",
                "show": false,
                "record": false,
                "bounds": null
            }
        }
    }

    // 缓存的数据
    static CACHE_CONFIG = this.getConfigByDisk()

    // 语言包
    static messages = this.getLanguageList()

    // 窗口枚举
    static WINDOW_ENUM = {
        "MAIN": 0,
        "SEARCH": 1,
    }

    /**
     * @description: 获取语言包
     */
    static getLanguageList() {
        let messages = {}
        fs.readdirSync(path.join(__dirname, "../../resources/lang").replace("app.asar", "app.asar.unpacked")).map((item) => {
            let lang = item.split(".")[0]
            messages[lang] = require(path.join(__dirname, "../../resources/lang/" + item).replace("app.asar", "app.asar.unpacked"))
        })
        return messages
    }

    static getCurrentLang() {
        let config = this.getConfig()
        return this.messages[config.lang]
    }

    static init() {
        !fs.existsSync(CONFIG_PATH) && fs.writeFileSync(CONFIG_PATH, JSON.stringify(Config.DEFAULT_CONFIG))
    }

    /**
     * @description: 获取配置
     * @return {Config.DEFAULT_CONFIG}
     */
    static getConfig() {
        return this.CACHE_CONFIG
    }

    static getConfigByDisk() {
        this.init()
        return JSON.parse(fs.readFileSync(CONFIG_PATH).toString())
    }

    /**
    * @description: 设置配置
    * @return {*}
    */
    static setConfig(config) {
        this.checkDiff(config)
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config))
        this.CACHE_CONFIG = config
    }

    // 差异化检测 用于替换数据
    static checkDiff(config) {
        let source = this.getConfig()
        for (let item of Object.values(this.WINDOW_ENUM)) {
            let current = config.windows[item]
            let normal = source.windows[item]
            let window = this.WINDOWS[item]
            const register = () => {
                current.shortcut && globalShortcut.register(current.shortcut, () => {
                    // 防抖
                    let time = Date.now()
                    if (time - this.lastTime < 500) {
                        return
                    }
                    this.lastTime = time
                    window.isVisible() ? window.hide() : window.show()
                })
            }
            if (current.shortcut != normal.shortcut) {
                normal.shortcut && globalShortcut.unregister(normal.shortcut)
                if (!globalShortcut.isRegistered(current.shortcut)) {
                    register()
                } else {
                    current.shortcut = ""
                    let lang = this.messages[config.lang]
                    dialog.showMessageBox(window, {
                        type: "error",
                        title: `[${current.shortcut}]${lang.shortcut_use}`,
                        message: lang.shortcut_please_reset,
                    })
                }
            }
        }
    }


    /**
     * @description: 根据配置设置窗口位置与显示
     */
    static setWindowPosition(key, center = false, force = false) {
        let config = this.getConfig()
        let window = this.WINDOWS[key]
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
        return config
    }


    // 注册位置大小变动监听事件
    static RIGSTER = {
        [Config.WINDOW_ENUM.MAIN]: null,
        [Config.WINDOW_ENUM.SEARCH]: null,
    }

    // 窗口对象
    static WINDOWS = {
        [Config.WINDOW_ENUM.MAIN]: null,
        [Config.WINDOW_ENUM.SEARCH]: null,
    }

    /**
     * @description: 注册位置大小变动监听事件
     */
    static registerRecord(window, key) {
        let config = this.getConfig()
        this.WINDOWS[key] = window
        let record = config.windows[key].record
        let shortcut = config.windows[key].shortcut
        this.RIGSTER[key] = () => {
            if (record && window.isMovable()) {
                // 防抖
                let time = Date.now()
                if (time - this.lastTime < 500) {
                    return
                }
                this.lastTime = time
                config.windows[key].bounds = window.getBounds()
                this.setConfig(config)
            }
        }
        window.off("resized", this.RIGSTER[key])
        window.off("moved", this.RIGSTER[key])
        window.on("resized", this.RIGSTER[key])
        window.on("moved", this.RIGSTER[key])
        const register = () => {
            shortcut && globalShortcut.register(shortcut, () => {
                // 防抖
                let time = Date.now()
                if (time - this.lastTime < 500) {
                    return
                }
                this.lastTime = time
                window.isVisible() ? window.hide() : window.show()
            })
        }
        register()

    }

}