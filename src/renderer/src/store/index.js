/*
 * @Date: 2025-05-30 21:03:36
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-20 17:00:21
 * @FilePath: \electron-shell-manager\src\renderer\src\store\index.js
 */
import { defineStore } from 'pinia'
const api = window.api
export default defineStore('store', {
  state: () => {
    return {
      // 插件列表
      tools: [],
      dev_tools: null,
      console_visible: false
    }
  },
  actions: {
    // 获取插件列表
    async getToolsList() {
      let { data } = await window.electron.ipcRenderer.invoke(api.TOOLS.GET_TOOLS_LIST)
      this.tools = data
    },
    // 插件开发状态
    async getToolDev() {
      let data = await window.electron.ipcRenderer.invoke(api.TOOLS.TOOLS_DEV_STATUS)
      this.dev_tools = data
    },
    setConsole(event, status) {
      this.console_visible = status
    }
  }
})
