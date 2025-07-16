/*
 * @Author: 羊驼
 * @Date: 2025-07-04 09:06:50
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 13:52:10
 * @Description: file content
 */
import { BrowserWindow, ipcMain, app, nativeImage } from 'electron'
import path from "node:path"
import { is } from '@electron-toolkit/utils'
import Config from '../config';
import Application from "./application"
import api from '@resources/js/api';
import icon from '@resources/pictures/icon.png?asset&asarUnpack'

export default class DesktopManager {

    // 文件窗口
    window_file = null
    // 控制台窗口
    window_terminal = null
    // 主窗口
    mainWindow = Application.window

    // 单例
    static _instance = null

    static getInstance = () => {
        if (!this._instance) {
            this._instance = new DesktopManager()
        }
        return this._instance
    }

    constructor() {
        this.init()
    }

    // 根据配置初始化显示
    init() {
        let { windows } = Config.getConfig()
        windows[2].show && this.getWindowFile()
        windows[1].show && this.terminalWindowShow()
    }

    /**
     * @description: 创建文件窗口
     * @return {*}
     */
    getWindowFile() {
        if (this.window_file) {
            Config.setWindowPosition(Config.WINDOW_ENUM.FILE)
            return this.window_file
        }
        let window = new BrowserWindow({
            width: 500,
            height: 300,
            minWidth: 300,
            minHeight: 300,
            webPreferences: {
                preload: path.join(__dirname, '../preload/index.js'),
                sandbox: false

                // experimentalFeatures: true
            },
            // autoHideMenuBar: true,
            movable: true,
            skipTaskbar: true,
            // parent: this.mainWindow,
            resizable: true,
            frame: false,
            transparent: true,
            titleBarStyle: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            hasShadow: false,
            show: true
        })

        // !app.isPackaged && window.webContents.openDevTools()
        // window.setContentProtection(true)
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            // console.log(`${process.env['ELECTRON_RENDERER_URL']}/#/file`);
            window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/file`)
        } else {
            window.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: "file" })
        }
        Config.registerRecord(window, Config.WINDOW_ENUM.FILE)
        Config.setWindowPosition(Config.WINDOW_ENUM.FILE)
        let file_window_custom = Config.getConfig().file_window_custom
        ipcMain.handle(api.FILE_WINDOW.SET_SETTING, (event, setting) => {
            let { pin } = setting
            this.checkPin(window, pin)
            let config = Config.getConfig()
            config.file_window_custom = setting
            Config.setConfig(config)
        })

        this.window_file = window
        this.checkPin(window, file_window_custom.pin)
        return window
    }

    /**
     * @description: 窗口固定设置
     * @param {BrowserWindow} window
     * @param {boolean} pin
     * @return {*}
     */    
    checkPin(window, pin) {
        window.setAlwaysOnTop(pin, "screen-saver", 10)
        window.setMovable(!pin)
        window.setResizable(!pin)
    }

    /**
     * @description: 文件窗口显示
     * @return {*}
     */
    fileWindowShow() {
        let window = this.window_file
        if (!window) {
            window = this.getWindowFile()
            return
        }
        window.isVisible() ? window.hide() : window.show()
    }

    /**
     * @description: 控制台窗口显示
     * @return {*}
     */
    terminalWindowShow() {
        let window = this.window_terminal
        if (!window) {
            window = this.getWindowTerminal()
            return
        }
        window.isVisible() ? window.hide() : window.show()
    }

    /**
     * @description: 创建控制台窗口
     * @return {*}
     */
    getWindowTerminal() {
        if (this.window_terminal) {
            Config.setWindowPosition(Config.WINDOW_ENUM.TERMINAL)
            return this.window_terminal
        }
        let window = new BrowserWindow({
            width: 1024,
            height: 600,
            minWidth: 600,
            minHeight: 600,
            fullscreenable: true,
            webPreferences: {
                preload: path.join(__dirname, '../preload/index.js'),
                sandbox: false
                // experimentalFeatures: true
            },
            title: "脚本控制台",
            icon: nativeImage.createFromPath(icon),
            // autoHideMenuBar: true,
            movable: true,
            // skipTaskbar: true,
            // parent: this.mainWindow,
            resizable: true,
            frame: false,
            // transparent: true,
            titleBarStyle: 'hidden',
            // backgroundColor: 'rgba(0, 0, 0, 0)',
            hasShadow: false,
            show: true,
            // fullscreen: false
        })

        !app.isPackaged && window.webContents.openDevTools()
        // window.setContentProtection(true)
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            // console.log(`${process.env['ELECTRON_RENDERER_URL']}/#/file`);
            window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/terminal`)
        } else {
            window.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: "terminal" })
        }
        Config.registerRecord(window, Config.WINDOW_ENUM.TERMINAL)
        Config.setWindowPosition(Config.WINDOW_ENUM.TERMINAL)

        this.window_terminal = window
        let file_terminal_custom = Config.getConfig().file_terminal_custom

        this.checkPin(window, file_terminal_custom.pin)

        const events = {
            [api.TERM_WINDOW.CLOSE]: (event) => {
                window.hide()
                // this.window_terminal = null
            },
            [api.TERM_WINDOW.MINIMIZE]: (event) => {
                window.minimize()
            },
            [api.TERM_WINDOW.FULLSCREEN]: (event) => {
                window.setFullScreen(!window.isFullScreen())
                // console.log(window.isFullScreen());
            },
            [api.TERM_WINDOW.SET_SETTING]: (event, setting) => {
                let { file_terminal_custom: { pin } } = setting
                this.checkPin(window, pin)
                let config = Config.getConfig()
                Config.setConfig(config)
            }
        }
        for (let key in events) {
            ipcMain.handle(key, events[key])
        }
        return window
    }




}