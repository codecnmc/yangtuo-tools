<template>
  <div class="pb-12">
    <div class="mb-4 d-flex justify-end">
      <v-btn
        @click="consoleVisible=!consoleVisible"
        class="mr-2"
      >
        <template v-slot:prepend>
          <v-icon>
            mdi-console
          </v-icon>
        </template>
        {{$t('console')}}
      </v-btn>
      <v-btn
        color="success"
        class="mr-2"
        @click="addPlugin"
      >
        <template v-slot:prepend>
          <v-icon>
            mdi-plus
          </v-icon>
        </template>
        {{$t('add-plugin')}}</v-btn>
      <v-btn
        color="info"
        @click="openDev"
      >
        <template v-slot:prepend>
          <v-icon>
            mdi-code-tags
          </v-icon>
        </template>
        {{!devTool?$t('dev_tools'):$t('cancel_dev')}}</v-btn>
    </div>
    <div class="d-flex flex-wrap pa-2  ga-4">
      <v-card
        class="tool-card"
        :elevation="2"
        v-for="item,index in tools"
      >
        <div class="box">
          <v-img
            height="175px"
            :src="'data:image/png;base64,'+item.icon"
            cover
          ></v-img>
        </div>
        <div class="px-2">
          <v-card-title class="mt-2 px-2">
            {{item.name}}
            <v-chip
              v-if="devTool&&(devTool.name==item.name)"
              class="ml-2"
            >{{$t('development')}}</v-chip>
          </v-card-title>
          <div
            class="description px-2"
            style="font-size:13px"
          >
            {{item.description}}
          </div>
          <v-card-subtitle
            class="d-flex justify-space-between mt-4 px-2"
            style="font-size:12px"
          >
            <span>{{$t('version')}} v{{item.version}}</span>
            <div v-if="item.framework&&item.framework.length>0">
              <span
                v-for="framework in item.framework"
                :key="framework"
                class="ml-2"
              >
                {{framework}}
              </span>
            </div>
            <div v-else>
              {{$t('general')}}
            </div>
          </v-card-subtitle>

          <div class="d-flex px-2 py-6">
            <v-btn
              style="flex:1;"
              color="error"
              plain
              :elevation="0"
              :text="$t('uninstall')"
              class="mr-2"
              v-if="!devTool||(devTool.name!=item.name)"
              variant="outlined"
              @click="deletePlugin(item)"
            ></v-btn>
            <v-btn
              style="flex:1"
              :elevation="0"
              variant="outlined"
              :disabled="devTool&&(devTool.name==item.name)"
              :text="item.enable?$t('disable'):$t('enable')"
              :color="item.enable?'warning':'success'"
              @click.stop="setTool(item)"
            ></v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['invoke', 'api', 'message', 'on', 'remove', 'showConfirm', 'globalLoading'],
  data() {
    return {}
  },
  computed: {
    // 工具列表
    tools() {
      return this.$store.tools
    },
    // 开发中的工具
    devTool() {
      return this.$store.dev_tools
    },
    // 控制台显示
    consoleVisible: {
      get() {
        return this.$store.console_visible
      },
      set(val) {
        this.$store.setConsole('consoleVisible', val)
      }
    }
  },
  methods: {
    // 开发者模式
    async openDev() {
      this.globalLoading(true)
      if (this.devTool) {
        this.consoleVisible = false
        await this.invoke(this.api.TOOLS.TOOLS_DEV_END)
      } else {
        let res = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
          properties: ['openDirectory']
        })
        if (!res.canceled) {
          let path = res.filePaths[0]
          this.consoleVisible = true
          let result = await this.invoke(this.api.TOOLS.TOOLS_DEV_START, path)
          if (!result.status) {
            this.message({ type: 'error', message: result.message })
          }
        }
      }
      this.globalLoading(false)
    },
    // 开启或关闭插件
    async setTool(item) {
      this.globalLoading(true)
      let res = await this.invoke(this.api.TOOLS.SETTING_TOOLS, item, {
        enable: !item.enable
      })
      this.globalLoading(false)
      if (!res.status) return
      this.message({ type: 'success', message: this.$t('control_success') })
    },
    // 添加插件
    async addPlugin() {
      this.globalLoading(true)
      let res = await this.invoke(this.api.TOOLS.TOOLS_ADD)
      this.globalLoading(false)
      res && this.message({ type: res.status ? 'success' : 'error', message: res.message })
    },
    // 删除插件
    async deletePlugin(item) {
      this.showConfirm({
        title: this.$t('plugin_uninstall'),
        content: this.$t('uninstall_confirm'),
        submit: async (done) => {
          this.globalLoading(true)
          let res = await this.invoke(this.api.TOOLS.TOOLS_DELETE, item)
          this.globalLoading(false)
          if (!res.status) {
            this.message({ type: 'error', message: res.message })
            return
          }
          this.message({ type: 'success', message: this.$t('uninstall_success') })
          done()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-card {
  border-radius: 10px;
  min-width: 290px;
  transition: all 0.3s;
  .box {
    height: 175px;
    overflow: hidden;
  }
  .v-img {
    transition: all 0.3s;
    &:hover {
      // 放大图片
      transform: scale(1.5);
    }
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.2) !important;
  }
}
.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
  word-break: break-all;
  font-size: 14px;
  color: #6b7280;
}
</style>