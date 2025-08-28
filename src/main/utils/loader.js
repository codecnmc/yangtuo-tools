import { app, shell, ipcMain, dialog, screen, BrowserWindow, Notification, globalShortcut } from 'electron'
import path from "node:path"
import fs from "node:fs"
import chokidar from "chokidar";
import { pathToFileURL } from 'node:url';
import Config from "../config.js"
import Application from './application.js';
import DataListener from '../listener';
import api from '@resources/js/api';
const PLUGINS_PATH = path.join(__dirname, "../../resources/plugins").replace("app.asar", "app.asar.unpacked")
const TEMP_PRELOAD = path.join(__dirname, "../../resources/temp").replace("app.asar", "app.asar.unpacked")
const PLUGIN_SETTING = "setting.json"
const EXTRA_LINE = 20
const TEMPLATE_PRELOAD = path.resolve(path.join(__dirname, '../../resources/js/preload.mjs')).replace("app.asar", "app.asar.unpacked")
const TEMPLATE_DATA = fs.readFileSync(TEMPLATE_PRELOAD).toString()

global.SHARE = {
    win: {},
    loadScript: {},
    language: {}
}

/**
 * @description: 插件读取
 * @return {*}
 */
export default class PluginLoader {

    webviewEvent = api.SYSTEM.WEBVIEW
    mainWindow = Application.window
    SHARE = global.SHARE
    PLUGINS = {}
    INJECT = {}
    SETTINGS = {}
    DEV_PLUGINS = null
    DEV_PLUGINS_PATH = null
    DEV_PLUGINS_WATCH = null
    DEV_PLUGIN_WATCH_VIEW = null

    constructor() {
        if (!fs.existsSync(TEMP_PRELOAD)) {
            fs.mkdirSync(TEMP_PRELOAD)
        }
        if (!fs.existsSync(PLUGINS_PATH)) {
            throw new Error("不存在plugin目录")
        }
        // 退出前清空所有界面
        app.on("before-quit", () => {
            let PLUGINS = this.PLUGINS
            for (let key in PLUGINS) {
                let item = PLUGINS[key]
                this.killWin(item && item.win)
                PLUGINS[key] = null
            }
            // 清空temp目录
            let temp_path = TEMP_PRELOAD.replace("app.asar", "app.asar.unpacked")
            if (fs.existsSync(temp_path)) {
                fs.rmSync(temp_path, { recursive: true })
            }
        })
        process.on("uncaughtException", (err) => {
            let lang = Config.getCurrentLang()
            console.log(lang.catch_error, err)
            this.catchError(true, lang.catch_error, err)
        })

        process.on("unhandledRejection", (err) => {
            let lang = Config.getCurrentLang()
            console.log(lang.catch_async_error, err)
            this.catchError(true, lang.catch_async_error, err)
        })

    }

    setInject = (inject) => {
        this.INJECT = inject
    }

    onUpdate = () => {
        DataListener.broadcast(api.UPDATE.TOOLS)
    }

    onMessage = (type, args) => {
        this.mainWindow.webContents.send(api.TOOLS.TOOLS_DEV_CONSOLE, type, args)
    }

    injectCSS = () => {
        let main = fs.readFileSync(path.join(__dirname, "../../resources/styles/main.css").replace("app.asar", "app.asar.unpacked")).toString()
        return main
    }

    /**
    * @description: 封装插件用的electron包 要做限制
    */
    electronPack = (setting) => {
        let CACHE_ON = {}
        const createCache = (command, callback, rigster = true) => {
            let cache = (event, ...args) => {
                let temp = event.reply
                const reply = (channel, ...args) => {
                    temp(`${setting}:${channel}`, ...args)
                }
                event.reply = reply
                callback(event, ...args)
            }
            if (rigster) {
                if (!CACHE_ON[`${setting}:${command}`]) {
                    CACHE_ON[`${setting}:${command}`] = []
                }
                CACHE_ON[`${setting}:${command}`].push(cache)
            }

            return cache
        }
        return {
            language: {
                addListener: (callback) => {
                    if (!global.SHARE.language[setting]) {
                        global.SHARE.language[setting] = []
                    }
                    global.SHARE.language[setting].push(callback)
                },
                removeListener: (callback) => {
                    let index = global.SHARE.language[setting].indexOf(callback)
                    if (index != -1) {
                        global.SHARE.language[setting].splice(index, 1)
                    }
                },
                clearListener: () => {
                    global.SHARE.language[setting] = []
                },
                getLanguage: () => {
                    return Config.CACHE_CONFIG.lang
                },
            },
            app,
            ...this.INJECT,
            dialog,
            screen,
            ipcMain: {
                handle: (command, callback) => {
                    ipcMain.handle(`${setting}:${command}`, callback)
                },
                handleOnce: (command, callback) => {
                    ipcMain.handleOnce(`${setting}:${command}`, callback)
                },
                removeHandler: (command) => {
                    ipcMain.removeHandler(`${setting}:${command}`)
                },
                on: (command, callback) => {
                    let cache = createCache(command, callback)
                    ipcMain.on(`${setting}:${command}`, cache)
                },
                once: (command, callback) => {
                    let cache = createCache(command, callback, false)
                    ipcMain.once(`${setting}:${command}`, cache)
                },
                off: (command, callback) => {
                    let listeners = CACHE_ON[`${setting}:${command}`]
                    if (!listeners || !listeners.length) {
                        ipcMain.removeAllListeners(`${setting}:${command}`)
                        return
                    }
                    let index = listeners.findIndex(x => x == callback)
                    if (index == -1) {
                        ipcMain.removeAllListeners(`${setting}:${command}`)
                        return
                    }
                    let target = listeners[index]
                    listeners.splice(index, 1)
                    ipcMain.off(`${setting}:${command}`, target)
                },
                removeAllListeners: (command) => {
                    delete CACHE_ON[`${setting}:${command}`]
                    ipcMain.removeAllListeners(`${setting}:${command}`)
                },
            },
            BrowserWindow: (electron) => {
                if (!electron) {
                    return
                }
                if (!electron.webPreferences) {
                    electron.webPreferences = {}
                }
                electron.webPreferences.preload = path.join(TEMP_PRELOAD, `${setting}.mjs`)
                electron.webPreferences.sandbox = false
                let win = new BrowserWindow(electron)
                const send = win.webContents.send
                win.webContents.send = function (channel, ...args) {
                    send.apply(this, [`${setting}:${channel}`, ...args])
                }
                let config = this.SETTINGS[setting] || {}
                config.injectCss && win.webContents.insertCSS(this.injectCSS())
                return win
            },
            Notification,
            globalShortcut,
            shell,
        }
    }

    // 关闭窗口
    killWin = (win) => {
        win && !win.isDestroyed() && win.close()
    }

    // 关闭开发模式
    killDev = () => {
        this.DEV_PLUGINS && this.unloadPlugin(this.DEV_PLUGINS)
        this.DEV_PLUGINS = null
        this.DEV_PLUGINS_PATH = null
        this.DEV_PLUGINS_WATCH && this.DEV_PLUGINS_WATCH.close()
        this.DEV_PLUGINS_WATCH = null
        this.DEV_PLUGIN_WATCH_VIEW && this.DEV_PLUGIN_WATCH_VIEW.close()
        this.DEV_PLUGIN_WATCH_VIEW = null
        this.onUpdate()
    }

    // 生成错误捕捉数据
    catchError = (dev, script, err) => {
        const lines = err.stack.split("\n")
        let match = lines[1].match(/at (.*) \((.*):(\d+):(\d+)\)/);
        let message = ''
        if (match && match.length) {
            message = `at ${match[1]}（${match[2]}:${Number(match[3]) - EXTRA_LINE}:${match[4]}）`
        }
        else {
            let pluginError = lines[1].match(/at file:\/\/\/(.*?)(?=\/\.temp-\d+)/)
            if (pluginError && pluginError[1]) {
                let error = lines[1].match(/at file:\/\/\/(.*?)(\.temp-\d+\.mjs):(\d+):(\d+)/);
                let pluginPath = pluginError[1].replaceAll("/", "\\")
                let pluginName = pluginPath.split("\\").pop()
                let DEV_PLUGINS = this.DEV_PLUGINS
                let isDev = DEV_PLUGINS && DEV_PLUGINS.name == pluginName
                if (!isDev) {
                    try {
                        let target = fs.readFileSync(path.join(PLUGINS_PATH, pluginName, PLUGIN_SETTING))
                        this.unloadPlugin(JSON.parse(target))
                    } catch (err) {

                    }
                    // let lang = Config.getCurrentLang()
                    // dialog.showErrorBox(`${pluginName}`, lang.plugin_loading_error)
                } else {
                    message = `at ${error[1]}${error[2]}:${Number(error[3]) - EXTRA_LINE}:${error[4]}）`
                }
            }
        }
        if (dev && !this.mainWindow.isDestroyed()) {
            this.onMessage && this.onMessage("error", [script, lines[0], message])
        }
    }

    // 写入设置
    writeSetting(path, setting) {
        let json = JSON.parse(JSON.stringify(setting))
        delete json.icon
        delete json.preload
        fs.writeFileSync(path, JSON.stringify(json))
    }

    // 动态读取脚本
    loadScript = async (setting) => {
        let DEV_PLUGINS = this.DEV_PLUGINS
        let dev = DEV_PLUGINS && DEV_PLUGINS.name == setting.name
        // 动态读取插件下的脚本
        let script = fs.readFileSync(path.join(setting.path, setting.script)).toString()
        const ConsoleString = `
                let Console=new Proxy(share.console,{
                    get(target,prop){
                        return function (...args) {
                            return target[prop].apply(this,[__filename,...args]);
                        };
                    }
                });`

        const head = (path) => {
            return `
                const isDev=${dev}
                const share=global.SHARE
                var __filename="${encodeURIComponent(setting.script)}";
                __filename=decodeURIComponent(__filename);
                var __dirname = "${encodeURIComponent(path)}"; 
                __dirname=decodeURIComponent(__dirname);
                let electron=share.electron("${setting.name}");
                let win=share.win["${setting.name}"];
                let loadScript=share.loadScript["${setting.name}"];
                ${dev ? ConsoleString : "let Console=console;"}
                `
        }

        const injectedCode = `
                    ${head(setting.path)}
                    ${script}
                `;

        const tmpFile = path.join(setting.path, `.temp-${Date.now()}.mjs`)
        fs.writeFileSync(tmpFile, injectedCode, "utf-8");
        try {
            // 2. 用真实文件路径 import，Node 会自动解析 pluginDir/node_modules
            const mod = await import(pathToFileURL(tmpFile).href)
            // 判断Mod是不是class
            if (mod && typeof (mod.default) != "object" && Function.prototype.toString.call(mod.default).includes('class')) {
                console.log("class", mod.default)
                return mod.default
            }
            else if (mod && typeof (mod.default) == "function") {
                console.log("function", mod.default)
                return mod
                    && mod.default && mod.default().catch((err) => {
                        console.log("LoadScript出错：" + err);
                        this.catchError(true, setting.script, err)
                        if (!dev) {
                            throw Error(`${setting.name}插件加载失败 \n${err.stack}`)

                        }
                    })
            } else {
                console.log("{}", mod.default)
                return mod.default
            }
        } catch (err) {
            this.catchError(true, setting.script, err)
            if (!dev) {
                throw Error(`${setting.name}插件加载失败 \n${err.stack}`)
            }
        } finally {
            fs.rmSync(tmpFile);
        }
    }


    // 加载插件
    loadPlugin = async (setting, dev = false) => {
        try {
            let { PLUGINS, DEV_PLUGINS_PATH, DEV_PLUGINS_WATCH, DEV_PLUGIN_WATCH_VIEW, SHARE } = this
            if (PLUGINS[setting.name]) return
            this.SETTINGS[setting.name] = setting
            let type = setting.type
            PLUGINS[setting.name] = {}
            DEV_PLUGINS_WATCH && DEV_PLUGINS_WATCH.close()
            DEV_PLUGIN_WATCH_VIEW && DEV_PLUGIN_WATCH_VIEW.close()
            let ignored = []
            if (DEV_PLUGINS_PATH) {
                ignored = [path.join(DEV_PLUGINS_PATH, "node_modules"), path.join(DEV_PLUGINS_PATH, "static"), path.join(DEV_PLUGINS_PATH, "*.mjs"), path.join(DEV_PLUGINS_PATH, "types")]
            }
            if (type == "window") {
                let electron = setting.electron || { width: 400, height: 300, webPreferences: {} }
                electron.webPreferences.preload = setting.preload
                electron.webPreferences.sandbox = false
                let win = new BrowserWindow({ ...electron, parent: this.mainWindow })
                setting.injectCss && win.webContents.on('did-finish-load', () => {
                    win.webContents.insertCSS(this.injectCSS());
                });
                win.hide()
                win.on("ready-to-show", () => {
                    electron.center && win.center()
                })
                win.on("closed", () => {
                    !dev && this.unloadPlugin(setting)
                })
                win.setMenu(null)
                if (dev) {
                    let dev = setting.dev || { local: true, port: null, devTools: true }
                    if (dev.local) {
                        let MAIN_PATH = path.join(DEV_PLUGINS_PATH, setting.main)
                        ignored.push(MAIN_PATH)
                        this.DEV_PLUGINS_WATCH = chokidar.watch(DEV_PLUGINS_PATH, { ignored })
                        this.DEV_PLUGIN_WATCH_VIEW = chokidar.watch(MAIN_PATH)
                        this.DEV_PLUGIN_WATCH_VIEW.on("change", () => {
                            win.reload()
                        })
                        win.loadFile(path.join(this.DEV_PLUGINS_PATH, setting.main))
                    } else {
                        ignored.push(path.join(this.DEV_PLUGINS_PATH, "view"))
                        this.DEV_PLUGINS_WATCH = chokidar.watch(this.DEV_PLUGINS_PATH, { ignored })
                        win.loadURL(`http://localhost:${dev.port}`)
                    }
                    this.DEV_PLUGINS_WATCH.once("change", (et, fn) => {
                        this.unloadPlugin(setting)
                        let settingPath = path.join(DEV_PLUGINS_PATH, PLUGIN_SETTING)
                        if (et == settingPath) {
                            let data = JSON.parse(fs.readFileSync(settingPath).toString())
                            setting.electron = data.electron
                        }
                        this.loadPlugin(setting, true)
                    })
                    dev.devTools && win.webContents.openDevTools()
                } else {
                    win.loadFile(path.join(PLUGINS_PATH, setting.name, setting.main))
                }
                const send = win.webContents.send
                win.webContents.send = function (channel, ...args) {
                    send.apply(this, [`${setting.name}:${channel}`, ...args])
                }
                electron.show && win.show()
                PLUGINS[setting.name].win = win
                SHARE.win[setting.name] = win
            } else {
                if (dev) {
                    if (setting.dev.local) {
                        let MAIN_PATH = path.join(DEV_PLUGINS_PATH, setting.main)
                        ignored.push(MAIN_PATH)
                        this.DEV_PLUGIN_WATCH_VIEW = chokidar.watch(MAIN_PATH)
                        this.DEV_PLUGIN_WATCH_VIEW.on("change", () => {
                            this.mainWindow.webContents.send(this.webviewEvent, `${setting.name}:reload`)
                        })
                    }
                    ignored.push(path.join(this.DEV_PLUGINS_PATH, "view"))
                    this.DEV_PLUGINS_WATCH = chokidar.watch(DEV_PLUGINS_PATH, { ignored })
                    this.DEV_PLUGINS_WATCH.once("change", (et, fn) => {
                        this.unloadPlugin(setting)
                        this.loadPlugin(setting, true)
                    })

                }
                SHARE.win[setting.name] = {
                    webContents: {
                        send: (channel, ...args) => {
                            // 处理插件发送的消息
                            BrowserWindow.getAllWindows().forEach((win) => {
                                if (win.id != this.mainWindow.id)
                                    win.webContents.send(`${setting.name}:${channel}`, ...args)
                            })
                            // 处理webview的情况
                            this.mainWindow.webContents.send(this.webviewEvent, `${setting.name}:${channel}`, ...args)
                        }
                    }
                }
            }
            SHARE.electron = this.electronPack
            SHARE.console = this.customConsole(this.onMessage)
            SHARE.loadScript[setting.name] = (target_path) => {
                let t_p = target_path.replace(/\//g, "/")
                return this.loadScript({ path: setting.path, name: setting.name, script: t_p })
            }
            PLUGINS[setting.name].js = await this.loadScript(setting)
            this.onUpdate()
        } catch (err) {
            console.log(err);
            this.unloadPlugin(setting)
            if (!dev) {
                // this.unloadPlugin(setting)
                throw Error(err)
            }
        }
    }

    // 卸载插件
    unloadPlugin = (setting, restart) => {
        let { PLUGINS, SHARE, DEV_PLUGINS } = this
        if (!PLUGINS[setting.name]) return
        try {
            PLUGINS[setting.name].js && PLUGINS[setting.name].js.unload && PLUGINS[setting.name].js.unload()
        } catch (err) {
            this.catchError(true, setting.script, err)
        }
        this.killWin(PLUGINS[setting.name].win)
        delete PLUGINS[setting.name]
        delete this.SETTINGS[setting.name]
        SHARE.win[setting.name] = null
        SHARE.loadScript[setting.name] = null
        if (!DEV_PLUGINS || setting.name != DEV_PLUGINS.name) {
            let writePath = path.join(PLUGINS_PATH, setting.name, PLUGIN_SETTING)
            let json = JSON.parse(JSON.stringify(setting))
            if (!restart) {
                json.enable = false
            }
            this.writeSetting(writePath, json)
        }
        this.onUpdate()
    }

    // 获取插件列表
    getPluginList = async () => {
        let plugins = []
        // 只要文件夹类型的
        let files = fs.readdirSync(PLUGINS_PATH)
        let fail = []
        let DEV_PLUGINS = this.DEV_PLUGINS
        for (let file of files) {
            let target = path.join(PLUGINS_PATH, file, PLUGIN_SETTING)
            if (!fs.existsSync(target)) continue
            // 校验json格式
            try {
                let setting = JSON.parse(fs.readFileSync(target, "utf-8").toString())
                if (!this.checkSetting(path.join(PLUGINS_PATH, file), setting)) continue
                let cover = path.join(PLUGINS_PATH, file, setting.cover)
                if (fs.existsSync(cover)) {
                    setting.icon = fs.readFileSync(cover).toString("base64")
                }
                plugins.push(setting)
                // 判断配置是否加载
                setting.path = path.join(PLUGINS_PATH, file)
                if (setting.enable) {
                    this.getPreload(setting)
                    await this.loadPlugin(setting)
                }
            } catch (err) {
                //TODO 校验失败 记录哪个插件
                console.log(err.message);
                if (err.message.includes("插件加载失败")) {
                    let lang = Config.getCurrentLang()
                    let setting = JSON.parse(fs.readFileSync(target, "utf-8").toString())
                    fail.push(setting.name)
                    setting.enable = false
                    this.writeSetting(target, setting)
                    dialog.showErrorBox(lang.plugin_loading_error, setting.name + lang.loading_error + "\n" + err)
                }

            }
        }
        if (DEV_PLUGINS) {
            plugins = plugins.filter((x) => x.name != DEV_PLUGINS.name)
            DEV_PLUGINS && plugins.push(DEV_PLUGINS)
        }
        return plugins
    }

    /**
     * @description: 检查配置
     * @param {*} setting
     * @return {*}
     */
    checkSetting = (rootPath, setting) => {

        if (!setting.name || !setting.type || !setting.main || !setting.description) {
            return false
        }
        let main = path.join(rootPath, setting.main)
        let script = path.join(rootPath, setting.script)
        if (!fs.existsSync(main)) {
            return false
        }
        if (!fs.existsSync(script)) {
            return false
        }
        let type = ["view", "window"].includes(setting.type)
        if (!type) return false
        if (setting.framework && setting.framework.length > 0) {
            // 判断是不是当前架构
            // 系统
            let framework = `${process.platform}-${process.arch}`
            let include = setting.framework.includes(framework)
            if (!include) return false
        }
        return true
    }

    /**
     * @description: 回应前端处理
     * @param {Boolean} status
     * @param {String} message
     * @param {any} data
     */
    createResponse = (status, message, data) => {
        return { status, message, data }
    }

    // 打开开发者模式
    openDev = async (rootPath) => {
        try {
            let setting = path.join(rootPath, PLUGIN_SETTING)
            let PLUGINS = this.PLUGINS
            let lang = Config.getCurrentLang()
            if (!fs.existsSync(setting)) {
                return this.createResponse(false, lang.config_no_exist)
            }
            setting = fs.readFileSync(setting).toString()
            setting = JSON.parse(setting)
            if (!this.checkSetting(rootPath, setting)) {
                return this.createResponse(false, lang.config_error)
            }
            if (PLUGINS[setting.name]) {
                return this.createResponse(false, lang.sample_config_error)
            }
            this.getPreload(setting)
            setting.icon = fs.readFileSync(path.join(rootPath, "icon.jpg")).toString("base64")
            this.DEV_PLUGINS = setting
            this.DEV_PLUGINS.path = rootPath
            this.DEV_PLUGINS_PATH = rootPath
            await this.loadPlugin(setting, true)
            return this.createResponse(true, "开发者模式成功")
        } catch (err) {
            return this.createResponse(false, err.message)
        }
    }

    // 设置插件属性
    setPluginSetting = (item, config) => {
        let settingPath = path.join(PLUGINS_PATH, item.name, PLUGIN_SETTING)
        let json = fs.readFileSync(settingPath).toString()
        json = JSON.parse(json)
        json.enable = config.enable
        this.writeSetting(settingPath, json)
        if (!json.enable) {
            this.unloadPlugin(json)
        }
        this.onUpdate()
    }


    // 自定义Console
    customConsole = (onMessage) => {
        let Console = {
            clear: () => {
                onMessage("clear")
            }
        }
        for (let key of ["log", "info", "warn", "error", "trace"]) {
            Console[key] = function (...args) {
                let handleArgs = []
                if (key == "trace") {
                    const stack = new Error().stack;
                    const lines = stack.split("\n");
                    // 跳过前两行（Error和parseStackTrace函数自身）
                    const frames = lines.slice(2).map(line => {
                        // 匹配 "at functionName (filePath:line:column)" 格式
                        const match = line.match(/at (.*) \((.*):(\d+):(\d+)\)/);
                        if (match) {
                            return [
                                match[1],
                                match[2],
                                parseInt(match[3]),
                                parseInt(match[4])
                            ];
                        }
                        return [];
                    }).filter(Boolean); // 过滤无效行
                    let target = frames[1]
                    args.push(`at ${target[0]}（${target[1]}:${Number(target[2]) - EXTRA_LINE}:${target[3]}）`)
                }
                for (let item of args) {
                    // 判断类型去处理 有些数据不能序列化
                    let object = typeof (item) == "object"
                    let text = String(item)
                    try {
                        if (object) {
                            text = JSON.stringify(item)
                        }
                    } catch (err) {

                    }
                    handleArgs.push(text)
                }
                onMessage(key, handleArgs)
                return console[key](...args)
            }
        }
        return Console
    }

    // 卸载所有插件(包括开发模式)
    uninstallAll = () => {
        for (let key in this.PLUGINS) {
            this.unloadPlugin(this.PLUGINS[key], true)
        }
        this.killDev()
    }

    // 新增插件
    addPlugin = () => {
        let lang = Config.getCurrentLang()
        let target = dialog.showOpenDialogSync(this.mainWindow, {
            title: lang.select_plugin_directory,
            "properties": ["openDirectory"]
        })
        if (!target) return
        let setting_path = path.join(target[0], PLUGIN_SETTING)
        if (!fs.existsSync(setting_path)) {
            return this.createResponse(false, lang.config_no_exist)
        }
        let item = fs.readFileSync(setting_path).toString()
        try {
            item = JSON.parse(item)
        } catch (err) {
            return this.createResponse(false, lang.config_error)
        }
        let rootPath = path.join(PLUGINS_PATH, item.name)
        if (fs.existsSync(rootPath)) {
            fs.rmSync(rootPath, { recursive: true })
        }
        if (!this.checkSetting(target[0], item)) {
            return this.createResponse(false, lang.config_error)
        }
        fs.mkdirSync(rootPath)
        // 处理文件拷贝
        // 拷贝目录 并忽略某几个文件夹
        fs.cpSync(target[0], rootPath, {
            recursive: true,
            dereference: true, // 关键：不解析符号链接
            preserveTimestamps: true,
            filter: (src, dest) => {
                let name = path.basename(src)
                return !["types", "view", ".gitignore", "jsconfig.json", "readme.md",".git"].includes(name)
            }
        })
        this.onUpdate()
        return this.createResponse(true, "添加成功")
    }

    // 删除插件
    deletePlugin = (item) => {
        let lang = Config.getCurrentLang()
        if (this.DEV_PLUGINS && this.DEV_PLUGINS.name == item.name || this.PLUGINS[item.name]) {
            return this.createResponse(false, lang.delete_running_error)
        }
        let rootPath = path.join(PLUGINS_PATH, item.name)
        if (!fs.existsSync(rootPath)) {
            return this.createResponse(false, lang.plugin_no_exist)
        }
        try {
            fs.rmSync(rootPath, { recursive: true })
        } catch (err) {
            return this.createResponse(false, err.message)
        }
        this.onUpdate()
        return this.createResponse(true, "删除成功")
    }

    getPreload(setting) {
        let preload = path.join(TEMP_PRELOAD, setting.name + ".mjs")
        fs.writeFileSync(preload, TEMPLATE_DATA.replace("let setting = null", `let setting = {name:'${setting.name}'}`))
        setting.preload = preload
    }
}