/*
 * @Author: 羊驼
 * @Date: 2025-07-03 10:00:33
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 11:42:11
 * @Description: file content
 */
import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import Config from '../config'
import AutoLaunch from "auto-launch"

export default class Application {
    //　主窗口
    static window;
    constructor(createWindow) {
        Config.init()
        this.create(createWindow)
    }
    /**
     * @description: 配置初始化
     * @return {*}
     */

    /**
     * @description: 窗口创建
     * @param {import('electron').BrowserWindowConstructorOptions} createWindow
     * @return {*}
     */
    create(createWindow) {
        app.whenReady().then(() => {
            electronApp.setAppUserModelId('com.yangtuo.shell')
            const gotTheLock = app.requestSingleInstanceLock();
            !gotTheLock && app.quit();
            createWindow()
            this.afterCreate()
            app.on('activate', function () {
                if (BrowserWindow.getAllWindows().length === 0) createWindow()
            })
        })

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        process.on('uncaughtException', (err) => {
            console.error('未捕获的异常:', err);
            // process.exit(1); // 设置退出码为1
        });
    }

    /**
     * @description: 快捷键创建
     * @return {*}
     */
    afterCreate() {
        let config = Config.getConfig()
        Config.shortcut(config, false)
        const autoLauncher = new AutoLaunch({
            name: app.getName(),
            path: app.getPath('exe')
        });
        autoLauncher.isEnabled().then((isEnabled) => {
            if (config.run) {
                autoLauncher.enable()
            } else if (isEnabled) {
                autoLauncher.disable()
            }
        })

        Config.setConfig(config)
    }
}