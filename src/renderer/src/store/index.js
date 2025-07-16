/*
 * @Date: 2025-05-30 21:03:36
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 10:48:34
 * @FilePath: \electron-shell-manager\src\renderer\src\store\index.js
 */
import { defineStore } from 'pinia'
import common from '@resources/js/common.js'
const api = window.api
export default defineStore('store', {
  state: () => {
    return {
      // 运行状态
      STATUS: common.STATUS,
      // 可启动的exe后缀
      EXE_OPTIONS: ['exe', 'bat', 'cmd', 'ps1', 'js'],
      config: {
        "show": "F8", "desk_file": "F7", "desk_terminal": "Alt+Z",
        "run": false, "order": true, "immediately": false, "terminal": true
      },
      // 启动项数据
      shells: [],
    }
  },
  actions: {
    async getConfig() {
      let data = await window.electron.ipcRenderer.invoke(api.SYSTEM.GET_CONFIG)
      this.config = data
    },
    async setConfig() {
      await window.electron.ipcRenderer.invoke(api.SYSTEM.SET_CONFIG, JSON.parse(JSON.stringify(this.config)))
    },
    // 获取启动项列表
    async getShellList() {
      let { data } = await window.electron.ipcRenderer.invoke(api.SHELL.GET_SHELL_LIST)
      this.shells = data
    },
  }
})
