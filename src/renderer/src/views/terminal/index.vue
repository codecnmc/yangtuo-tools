<!--
 * @Author: 羊驼
 * @Date: 2025-07-01 16:41:15
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-17 11:26:15
 * @Description: 脚本控制台页面
-->
<template>

  <v-app
    class="page terminal"
    :class="{bg:config.appearance.glass}"
  >
    <v-system-bar
      window
      class="title d-flex justify-space-between align-center"
      :class="{glass:config.appearance.glass}"
    >
      <v-btn
        icon="mdi-menu"
        size="small"
        flat
        variant="text"
        :ripple="false"
        rounded="0"
        @click="drawer=!drawer"
        class="px-0"
      ></v-btn>
      脚本控制台
      <div>
        <v-btn
          :icon="config.file_terminal_custom.pin?'mdi-pin-off':'mdi-pin'"
          size="small"
          flat
          variant="text"
          @click="setPin(!config.file_terminal_custom.pin)"
          :ripple="false"
          rounded="0"
        ></v-btn>
        <v-btn
          @click="invoke(api.TERM_WINDOW.MINIMIZE)"
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
          @click="invoke(api.TERM_WINDOW.FULLSCREEN)"
        ></v-btn>

        <v-btn
          icon="mdi-close"
          size="small"
          flat
          variant="text"
          @click="invoke(api.TERM_WINDOW.CLOSE)"
          :ripple="false"
          rounded="0"
        ></v-btn>
      </div>
    </v-system-bar>
    <v-main
      class="content"
      :class="{glass:config.appearance.glass}"
    >
      <v-tabs
        v-model="group"
        class="mb-2"
        v-if="refresh"
      >
        <v-tab
          :value="item"
          v-for="item in Object.keys(groupList)"
          :key="item"
          @dblclick="open('edit',item)"
        >{{item}}
          <v-icon
            :size="20"
            class="mt-1 ml-2 close-btn"
            v-if="item!=group"
            @click.self.stop="deleteGroup(item)"
          >
            mdi-close
          </v-icon>
        </v-tab>
        <v-btn
          icon
          flat
          variant="text"
          :ripple="false"
          rounded="0"
          class="mt-1"
          @click="open('create')"
        >
          <v-icon :size="36">
            mdi-plus
          </v-icon>
        </v-btn>
      </v-tabs>
      <div
        class="empty top-0 left-0 position-absolute d-flex justify-center align-center text-h5"
        v-if="shows&&!shows.length"
      >
        暂无展示的控制台
      </div>
      <div
        v-else
        class="mt-4"
      >
        <draggable
          handle=".console-title"
          v-model="shows"
          :flex="true"
          :flexWrap="true"
          console-card
          :swapThreshold="1"
          :animation="100"
        >
          <v-card
            flat
            class="console-card"
            v-for="item,index in shows"
            :key="item.id"
          >
            <v-card-title class="cursor-pointer d-flex justify-space-between console-title text-body-2">
              <div>{{item.name}}：{{item.status}}<span
                  class="ml-2"
                  v-if="item.status==STATUS.运行中"
                >({{item.memory}}MB)</span></div>
              <div>

                <v-btn
                  color="success"
                  icon="mdi-play"
                  size="mini"
                  flat
                  variant="text"
                  rounded="0"
                  :loading="loading"
                  @click="command(api.SHELL.START_SHELL,item.id)"
                  v-if="[STATUS.未启动,STATUS.已退出,STATUS.已关闭,STATUS.暂停中,STATUS.已停止].includes(item.status)&&item.enable"
                >
                </v-btn>

                <v-btn
                  color="error"
                  icon="mdi-stop"
                  size="mini"
                  flat
                  variant="text"
                  rounded="0"
                  :loading="loading"
                  @click="command(api.SHELL.STOP_SHELL,item.id)"
                  v-else
                >
                </v-btn>
                <v-btn
                  icon="mdi-close"
                  size="mini"
                  flat
                  variant="text"
                  :loading="loading"
                  rounded="0"
                  class="ml-2"
                  @click="setLogHide(index)"
                >
                </v-btn>
              </div>
            </v-card-title>
            <v-virtual-scroll
              class="black-console text-body-2"
              :height="calHeight()"
              :items="item.logs"
              v-if="refresh"
              :ref="item.id"
              @mouseenter="changeStatus(item.id,0)"
              @mouseleave="changeStatus(item.id,1)"
            >
              <template v-slot:default="{ item:log }">
                <v-list-item :class="log.type">
                  <div v-html="log.content" />
                </v-list-item>
              </template>
            </v-virtual-scroll>
          </v-card>
        </draggable>
      </div>
    </v-main>
    <v-navigation-drawer
      v-model="drawer"
      temporary
      class="drawer"
      width="256"
    >
      <v-list>
        <v-list-item
          v-for="item in shells"
          :key="item.id"
        >
          <v-icon
            v-if="showStatus&&!showStatus[item.id]"
            class="mr-2"
            @click="setLogShow(item)"
          >mdi-plus</v-icon>
          {{item.name}}
          <template v-slot:append>
            {{item.status}}
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-dialog
      v-model="visible"
      width="350px"
    >
      <v-card>
        <v-card-title>{{mode=='create'?'新增分组':'重命名'}}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              label="分组名称"
              v-model="current"
              clearable
              persistent-placeholder
              placeholder="请输入名称"
              :rules="[(v) => !!v || '名称不能为空']"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            flat
            @click="visible = false"
          >关闭</v-btn>
          <v-btn
            color="primary"
            class="ml-4"
            @click="submit"
          >提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <messages v-model="messages" />
  </v-app>
</template>

<script>
import Draggable from '@renderer/components/Draggable.vue'
import Messages from '../../components/Messages.vue'
export default {
  components: { Draggable, Messages },
  inject: ['invoke', 'api', 'on', 'remove'],
  data() {
    return {
      // 消息队列
      messages: [],
      // 更新控制台任务数据的定时器
      interval: null,
      // 侧边栏的显示标识
      drawer: false,
      // 加载用
      loading: false,
      // 重渲染tabs的标识
      refresh: true,
      // 当前聚焦的分组
      group: '未分组',
      // 分组列表
      groupList: {
        未分组: []
      },
      // 脚本列表
      shells: [],
      // 编辑分组用的弹窗显示标识
      visible: false,
      // 编辑时 原分组的记录
      target: '',
      // 编辑时 输入框里的数据
      current: '',
      //　编辑模式
      mode: 'create',
      // 配置
      config: {
        appearance: {},
        file_terminal_custom: {}
      },
      scrollStatus: {}
    }
  },
  computed: {
    // 当前分组的脚本列表
    shows: {
      get() {
        return this.groupList[this.group]
      },
      set(value) {
        this.groupList[this.group] = value
      }
    },
    // 能否添加到分组
    showStatus() {
      if (!this.group) return {}
      if (!this.shows) return {}
      return this.shows.reduce((p, c) => {
        p[c.id] = c
        return p
      }, {})
    },
    // 脚本状态
    STATUS() {
      return this.$store.STATUS
    }
  },
  watch: {
    // 更新分组列表变动 保存到storage里 不存在数据库里
    groupList: {
      handler() {
        let target = {}
        for (let key in this.groupList) {
          target[key] = this.groupList[key].map((item) => {
            return {
              ...item,
              logs: []
            }
          })
        }
        localStorage.setItem('terminal', JSON.stringify(target))
      },
      deep: true
    }
  },
  // 卸载前的操作
  beforeUnmount() {
    clearInterval(this.interval)
    this.interval = null
    window.removeEventListener('resize', this.reRender)
  },
  // 初始化
  mounted() {
    // 获取缓存 配置变更事件监听和获取脚本
    this.getCache()
    this.remove(this.api.UPDATE.CONFIG, this.getConfig)
    this.on(this.api.UPDATE.CONFIG, this.getConfig)
    this.getConfig()
    window.addEventListener('resize', this.reRender)
    this.getShellList()
    this.interval = setInterval(() => {
      this.getShellList()
    }, 1000)
  },
  methods: {
    // 获取配置并根据配置去更新界面主题
    async getConfig() {
      let config = await this.invoke(this.api.SYSTEM.GET_CONFIG)
      this.config = config
      let body = document.body
      for (let key in this.config.appearance) {
        body.style.setProperty(key, this.config.appearance[key])
      }
    },
    // 设置固定状态
    setPin(pin) {
      this.config.file_terminal_custom.pin = pin
      this.invoke(this.api.TERM_WINDOW.SET_SETTING, this.config)
    },
    // 获取缓存
    getCache() {
      const reset = () => {
        this.groupList = { 未分组: [] }
        this.group = '未分组'
      }
      let cache = localStorage.getItem('terminal')
      if (cache) {
        this.groupList = JSON.parse(cache)
        this.group = Object.keys(this.groupList)[0]
        if (Object.keys(this.groupList).length == 0) {
          reset()
        }
      } else {
        reset()
      }
      this.reRender()
    },
    // 打开分组编辑框
    open(mode, key) {
      this.mode = mode
      if (mode == 'edit') {
        this.target = key
        this.current = key
      } else {
        this.current = ''
      }
      this.visible = true
    },
    // 提交分组数据
    async submit() {
      let { valid } = await this.$refs.form.validate()
      if (!valid) return
      if (this.mode == 'create') {
        if (this.groupList[this.current]) {
          return this.messages.push({ type: 'warning', message: '已存在该分组' })
        }
        this.groupList[this.current] = []
      } else {
        if (this.current != this.target && this.groupList[this.current]) {
          return this.messages.push({ type: 'warning', message: '已存在该分组' })
        }
        if (this.target == this.current) {
          return this.messages.push({ type: 'warning', message: '未检测到改动' })
        }
        this.groupList[this.current] = this.groupList[this.target]
        delete this.groupList[this.target]
        if (this.target == this.group) {
          this.group = this.current
          this.reRender()
        }
      }
      this.visible = false
    },
    // 计算控制台高度
    calHeight() {
      let length = Math.ceil(this.shows.length / 2)
      return (window.innerHeight - 108 - 56 * length) / length
    },
    // 重渲染
    reRender() {
      this.refresh = false
      this.$nextTick(() => {
        this.refresh = true
      })
    },
    // 获取脚本列表
    async getShellList() {
      let { data } = await this.invoke(api.SHELL.GET_SHELL_LIST)
      this.shells = data
      let groups = this.groupList
      let target = {}
      for (let item of this.shells) {
        target[item.id] = item
        for (let key in groups) {
          let list = groups[key]
          list.forEach((child, index) => {
            if (child.id == item.id) {
              list[index] = item
            }
          })
        }
      }
      let deleteItems = []
      for (let item of this.shows) {
        if (!target[item.id]) {
          deleteItems.push(item.id)
        }
      }
      deleteItems = new Set(deleteItems)
      this.shows = this.shows.filter((x) => !deleteItems.has(x.id))
      for (let item of this.shows) {
        if (this.scrollStatus[item.id] === undefined) {
          this.scrollStatus[item.id] = 1
        }
        if (this.scrollStatus[item.id] !== 0) {
          let target = this.$refs[item.id] && this.$refs[item.id][0] && this.$refs[item.id][0].$el
          // console.log(this.$refs[item.id])
          if (target) {
            // console.dir(target)
            target.scrollBy({ top: target.scrollHeight, behavior: 'smooth' })
            // console.log(target);
          }
        }
      }
    },
    // 控制台命令调用
    async command(command, id) {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1500)
      await this.invoke(command, id)
    },
    // 设置控制台显示
    setLogShow(item) {
      let exist = this.shows.find((c) => c.id == item.id)
      if (!exist) {
        this.shows.push(item)
      }
    },
    // 设置控制台隐藏
    setLogHide(index) {
      this.shows.splice(index, 1)
    },
    // 删除分组
    deleteGroup(group) {
      delete this.groupList[group]
    },
    changeStatus(id, status) {
      this.scrollStatus[id] = status
    }
  }
}
</script>

<style lang="scss" scoped>
.terminal {
  .empty {
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .drawer {
    background-color: var(--drawer-bg);
    color: var(--drawer-font);
  }

  .black-console {
    user-select: text;
    background-color: var(--console-bg);
    color: var(--console-font);
    &::-webkit-scrollbar {
      width: 8px;
      background-color: var(--console-scroll-bg);
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--console-scroll-thumb);
    }
    .error {
      color: var(--error-text);
    }
    &::v-deep .v-list-item__content {
      word-break: break-all !important;
      user-select: text;
    }
  }
  .console-card {
    background-color: var(--console-bg);
    color: var(--console-font);
    border: 1px solid var(--console-border);
    flex: 1;
    min-width: 48%;
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 20px;
  }
  .console-title {
    background-color: var(--console-title-bg);
    color: var(--console-title-font);
  }
}
</style>