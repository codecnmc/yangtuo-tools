/*
 * @Author: 羊驼
 * @Date: 2025-07-03 10:00:33
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-22 10:01:19
 * @Description: file content
 */
import { app, BrowserWindow } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import Config from '../config'
import AutoLaunch from "auto-launch"


export default class Application {
    //　主窗口
    static window;
    // 搜索窗口
    static search;
    static view;
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

    }

    /**
     * @description: 启动检测
     * @return {*}
     */
    afterCreate() {
        let config = Config.getConfig()
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
    }
}