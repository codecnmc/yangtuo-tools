<!--
 * @Author: 羊驼
 * @Date: 2025-06-18 16:40:30
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 14:09:17
 * @Description: 主界面
-->
<template>
  <v-app>
    <div class="page">
      <v-system-bar
        window
        class="title"
      >

        <span>{{$t('appname')}}</span>
        <v-spacer></v-spacer>

        <v-btn
          @click="invoke(api.SYSTEM.MINIMIZE)"
          icon="mdi-minus"
          size="small"
          flat
          variant="text"
          :ripple="false"
          rounded="0"
        ></v-btn>

        <v-btn
          icon="mdi-checkbox-blank-outline"
          size="small"
          flat
          variant="text"
          :ripple="false"
          rounded="0"
          @click="invoke(api.SYSTEM.FULLSCREEN)"
        ></v-btn>

        <v-btn
          icon="mdi-close"
          size="small"
          flat
          variant="text"
          @click="invoke(api.SYSTEM.CLOSE)"
          :ripple="false"
          rounded="0"
        ></v-btn>
      </v-system-bar>
      <v-navigation-drawer
        permanent
        :elevation="3"
        class="side-bar"
        width="200"
      >
        <v-list
          v-model:selected="active"
          nav
          mandatory
          @update:selected="checkView"
        >
          <v-list-item
            v-for="(item, i) in toolsMenu"
            :key="i"
            :value="item.id"
            color="primary"
          >
            <v-list-item-title>
              <v-icon class="mr-2">{{ item.icon }}</v-icon>
              {{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <v-container
          class="content"
          style="padding:0;margin:0"
        >
          <div
            v-for="(item, i) in toolsOptions"
            :key="item.name"
            v-show="current == item.id"
          >
            <webview
              :ref="item.id"
              nodeintegration
              :src="handleUrl(item)"
              :style="{width:'100%',height:'calc(100vh - 32px)'}"
              :preload="item.preload"
            />
          </div>
          <div
            v-show="current == menus[0].id"
            class="pa-4"
          >
            <Tools />
          </div>
          <div
            v-show="current == menus[1].id"
            class="pa-4"
          >
            <Setting />
          </div>
        </v-container>
      </v-main>
      <v-navigation-drawer
        permanent
        location="right"
        class="side-bar"
        v-if="consoleVisible"
        width="300"
      >
        <console />
      </v-navigation-drawer>
      <messages v-model="messages" />
      <v-dialog
        v-model="confirm.visible"
        width="400px"
      >
        <v-card color="white">
          <v-card-title class="d-flex justify-space-between">
            <span>{{confirm.title}}</span>
            <v-icon
              size="24"
              class="cursor-pointer"
              @click="confirm.close"
            >mdi-close</v-icon>
          </v-card-title>
          <v-card-text>
            {{confirm.content}}
          </v-card-text>
          <v-card-actions class="pa-4 d-flex justify-end">
            <v-btn
              flat
              @click="confirm.close"
            >{{$t('cancel')}}</v-btn>
            <v-btn
              color="primary"
              @click="confirm.submit"
            >{{$t('confirm')}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div
        class="loading"
        v-if="loading"
      >
        <div>
          <v-progress-circular
            indeterminate
            color="white"
            size="50"
          ></v-progress-circular>
          <div class="mt-4 text-white">{{$t('loading')}}</div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import Setting from './components/Setting/Setting.vue'
import logo from '@resources/pictures/icon.png?asset&asarUnpack'
import Messages from '../../components/Messages.vue'
import Tools from './components/Tools/Tools.vue'
import Console from './components/Console/Console.vue'
export default {
  inject: ['invoke', 'api', 'on', 'remove'],
  components: { Setting, Messages, Tools, Console },
  data() {
    return {
      logo,
      // 当前菜单选中项
      active: [1],
      // 消息
      messages: [],
      // 确认配置
      confirm: {
        visible: false,
        title: '',
        content: '',
        close: () => {},
        submit: () => {}
      },
      loading: false
    }
  },
  // 传输需要全局化的数据 但是不依靠pinia
  provide() {
    return {
      // 提示信息调用
      message: ({ type, message }) => {
        this.messages.push({ type, message })
      },
      // 弹窗确认调用
      showConfirm: ({ title, content, close = () => {}, submit = () => {} }) => {
        this.confirm.visible = true
        this.confirm.title = title
        this.confirm.content = content
        let done = () => {
          this.confirm.visible = false
        }
        this.confirm.close = () => {
          close()
          done()
        }
        this.confirm.submit = () => {
          submit(done)
        }
      },
      // 加载中
      globalLoading: (val) => {
        this.loading = val
      }
    }
  },
  computed: {
    // 当前菜单
    current() {
      return this.active[0]
    },
    toolsMenu() {
      return [
        ...this.toolsOptions.map((x, i) => ({
          id: i + 3,
          text: x.displayName,
          icon: 'mdi-application'
        })),
        ...this.menus
      ]
    },
    toolsOptions() {
      let devTool = this.$store.dev_tools
      let tools = this.$store.tools.filter((x) => {
        return (x.enable || (devTool && devTool.name == x.name)) && x.type == 'view'
      })
      tools = tools.map((x, i) => ({
        ...x,
        id: i + 3
      }))
      return tools
    },
    dev() {
      return this.$store.dev_tools
    },
    consoleVisible() {
      return this.$store.console_visible
    },
    menus() {
      return [
        {
          id: 1,
          text: this.$t('tools'),
          icon: 'mdi-tools'
        },
        {
          id: 2,
          text: this.$t('setting'),
          icon: 'mdi-cog'
        }
      ]
    }
  },
  unmounted() {
    this.remove(this.api.UPDATE.TOOLS, this.getToolsList)
    this.remove(this.api.SYSTEM.WEBVIEW, this.sendToWebview)
    this.remove(this.api.SEARCH.FOCUS_VIEW, this.focusView)
  },
  mounted() {
    this.getToolsList()
    this.remove(this.api.SYSTEM.WEBVIEW, this.sendToWebview)
    this.remove(this.api.UPDATE.TOOLS, this.getToolsList)
    this.remove(this.api.SEARCH.FOCUS_VIEW, this.focusView)
    this.on(this.api.UPDATE.TOOLS, this.getToolsList)
    this.on(this.api.SYSTEM.WEBVIEW, this.sendToWebview)
    this.on(this.api.SEARCH.FOCUS_VIEW, this.focusView)
  },
  methods: {
    checkView() {
      let webview = this.$refs[this.current]
      if (webview && webview[0]) {
        let target = webview[0]
        let item = this.toolsOptions.find((x) => x.id == this.current)
        let dev = this.$store.dev_tools
        if (dev && dev.displayName == item.displayName) {
          item.dev.devTools && !target.isDevToolsOpened() && target.openDevTools()
        }
        this.injectCss(target, item)
      }
    },
    injectCss(webview, item) {
      // css注入
      item.injectCss &&
        this.invoke(this.api.TOOLS.TOOLS_GET_CSS)
          .then((css) => {
            webview.insertCSS(css)
          })
          .catch((err) => {})
    },
    focusView(event, name) {
      for (let item of this.toolsOptions) {
        if (item.name == name) {
          this.active = [item.id]
          this.$nextTick(() => {
            let webview = this.$refs[item.id]
            if (webview && webview[0]) {
              setTimeout(() => {
                this.injectCss(webview[0], item)
              }, 500)
            }
          })
          break
        }
      }
    },
    sendToWebview(event, channel, ...args) {
      for (let item of this.toolsOptions) {
        let webview = this.$refs[item.id]
        if (webview && webview[0]) {
          if (channel && channel == `${item.name}:reload`) {
            webview[0].reload()
          } else webview[0].send(channel, ...args)
        }
      }
    },
    getToolsList() {
      this.$store.getToolsList()
      this.$store.getToolDev()
    },
    handleUrl(item) {
      // 处理路径问题 main 里面可能开头是./
      let main = item.main
      if (main.startsWith('./')) {
        main = main.substring(1)
      }
      let url = item.path + main
      let dev = this.dev
      let dev_url = ''
      if (dev && dev.name == item.name) {
        let setting = dev.dev
        if (setting.local) {
          dev_url = item.path + main
        } else {
          dev_url = `http://localhost:${item.dev.port}`
        }
        if (setting.hash) {
          dev_url += `/#/${setting.hash}`
        }
      }
      if (item.hash) {
        url += `/#/${item.hash}`
      }
      return dev && dev.name == item.name ? dev_url : url
    }
  }
}
</script>