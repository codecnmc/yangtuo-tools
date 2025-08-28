"use strict";
/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-28 10:39:32
 * @Description: file content
 */
import { contextBridge, webUtils, ipcRenderer } from 'electron'
let setting = null
const electron = {
    ipcRenderer: {
        // 调用ipc vue3的proxy 会导致对象无法传输 所以序列化一遍
        invoke(command, ...args) {
            let target = JSON.parse(JSON.stringify(args))
            return ipcRenderer.invoke(`${setting.name}:${command}`, ...target)
        },
        // ipcMain.webContents.send事件监听
        on(command, callback) {
            ipcRenderer.on(`${setting.name}:${command}`, callback)
        },
        once(command, callback) {
            ipcRenderer.once(`${setting.name}:${command}`, callback)
        },
        // 移除事件监听
        remove(command, callback) {
            ipcRenderer.removeListener(`${setting.name}:${command}`, callback)
        },
        // 发送事件监听给listener 的ipcMain.on 但是后续发现不需要 自己手动在底层brocast进行事件发送
        send(command, ...args) {
            ipcRenderer.send(`${setting.name}:${command}`, ...args)
        },
        sendSync(command, ...args) {
            return ipcRenderer.sendSync(`${setting.name}:${command}`, ...args)
        },
        
    },
    getPathForFile: webUtils.getPathForFile,
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electron)
    } catch (error) {
        console.error(error)
    }
} else {
    window.electron = electron
}
