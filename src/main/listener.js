/*
 * @Author: 羊驼
 * @Date: 2025-07-07 14:26:22
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 10:29:04
 * @Description: 事件监听与广播
 */
import { BrowserWindow, ipcMain } from 'electron'
export default class DataListener {

    constructor() {
        // 暂无需要监听的事件
    }

    /**
     * @description: 广播更新事件
     * @param {string} key
     * @return {*}
     */    
    static broadcast(key) {
        let windows = BrowserWindow.getAllWindows()
        windows.forEach((item) => {
            item.webContents.send(key)
        })
    }
}

