/*
 * @Author: 羊驼
 * @Date: 2025-07-07 14:26:22
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-22 10:00:48
 * @Description: 事件监听与广播
 */
import { BrowserWindow } from 'electron'
export default class DataListener {

    constructor() {
  
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

