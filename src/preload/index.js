/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-15 15:48:10
 * @Description: file content
 */
import { contextBridge, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import api from '@resources/js/api'
import path from "node:path"
import fs from "node:fs"
// 获取bg的base64 防止有缓存
const bgPath = () => {
  return fs.readFileSync(path.join(__dirname, '../../resources/pictures/bg.png')).toString("base64")
}

// Custom APIs for renderer
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('bgPath', bgPath)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('getPathForFile', (file) => webUtils.getPathForFile(file))
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.bgPath = bgPath
  window.getPathForFile = (file) => webUtils.getPathForFile(file)
}
