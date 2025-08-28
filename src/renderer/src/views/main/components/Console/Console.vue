<template>
  <div id="terminal">
  </div>
</template>

<script>
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import moment from 'moment'
import { FitAddon } from 'xterm-addon-fit'
import { CanvasAddon } from '@xterm/addon-canvas'
export default {
  inject: ['invoke', 'api', 'message', 'on', 'remove'],
  data() {
    return {
      term: new Terminal({
        convertEol: false, // 启用时，光标将设置为下一行的开头
        disableStdin: true, // 是否应禁用输入
        windowsMode: true, // 根据窗口换行
        cursorStyle: 'underline', // 光标样式
        cursorBlink: true, // 光标闪烁
        theme: {
          foreground: '#fff', // 字体颜色
          background: '#000000', // 背景色
          cursor: 'help', // 设置光标
          lineHeight: 20 // 行高
        }
      }),
      fit: new FitAddon()
    }
  },
  mounted() {
    this.remove(this.api.TOOLS.TOOLS_DEV_CONSOLE, this.getConsole)
    this.on(this.api.TOOLS.TOOLS_DEV_CONSOLE, this.getConsole)
    this.initTerm()
  },
  unmounted() {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    initTerm() {
      let term = this.term
      let fit = this.fit
      term.loadAddon(fit)
      term.loadAddon(new CanvasAddon())
      term.open(document.getElementById('terminal'))
      term.clear()
      window.addEventListener('resize', this.resize)
      this.$nextTick(this.resize())
      term.onSelectionChange(() => {
        term.hasSelection() && navigator.clipboard.writeText(term.getSelection())
      })
    },
    resize() {
      this.fit.fit()
    },
    getConsole(event, type, message) {
      let term = this.term
      if (type == 'clear') {
        return term.clear()
      }
      let suffix = ''
      switch (type) {
        case 'error':
        case 'trace':
          suffix = '\x1B[1;31m'
          break
        case 'warn':
          suffix = '\x1B[1;33m'
          break
        default:
          suffix = '\x1B[1;37m'
          break
      }
      let title = `${suffix}${type.toUpperCase()}--------`
      term.writeln(title)
      term.writeln(moment().format('HH:mm:ss') + ' ' + message[0])
      for (let i = 1; i < message.length; i++) {
        term.writeln(message[i])
      }
      let endTitle = `END------------`.substring(0, title.length - suffix.length)
      term.writeln(endTitle)
      term.writeln('\x1B[0m')
      term.writeln('')
    }
  }
}
</script>

<style>
#terminal {
  height:calc(100vh - 32px);
  width: 100%;
  background: #000;
  padding: 10px;
}
</style>