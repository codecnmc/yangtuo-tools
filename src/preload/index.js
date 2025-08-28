/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-26 10:35:59
 * @Description: file content
 */
import { contextBridge, webUtils, app } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import api from '@resources/js/api'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('getPathForFile', (file) => webUtils.getPathForFile(file))
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.getPathForFile = (file) => webUtils.getPathForFile(file)
}
