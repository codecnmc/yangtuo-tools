
<!--
 * @Date: 2025-05-30 21:03:36
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-20 16:30:43
 * @FilePath: \electron-shell-manager\src\renderer\src\App.vue
* @Description: 主页
-->
<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  provide() {
    return {
      api: window.api,
      invoke: this.invoke,
      on: this.on,
      remove: this.remove,
      send: this.send,
    }
  },
  methods: {
    // 调用ipc vue3的proxy 会导致对象无法传输 所以序列化一遍
    invoke(command, ...args) {
      let target = JSON.parse(JSON.stringify(args))
      return window.electron.ipcRenderer.invoke(command, ...target)
    },
    // ipcMain.webContents.send事件监听
    on(command, callback) {
      window.electron.ipcRenderer.on(command, callback)
    },
    // 移除事件监听
    remove(command, callback) {
      window.electron.ipcRenderer.removeListener(command, callback)
    },
    // 发送事件监听给listener 的ipcMain.on 但是后续发现不需要 自己手动在底层brocast进行事件发送
    send(command, ...args) {
      window.electron.ipcRenderer.send(command, ...args)
    }
  }
}
</script>