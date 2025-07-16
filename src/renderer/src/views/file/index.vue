<template>
  <v-app
    class="page file"
    :class="{bg:appearance.glass}"
  >

    <v-system-bar
      window
      class="title d-flex justify-space-between"
      :class="{glass:appearance.glass}"
    >
      <div>快速文件访问</div>
      <!-- <v-space /> -->
      <div>
        <!-- <v-btn
          icon="mdi-cog"
          size="small"
          flat
          variant="text"
          :ripple="false"
          rounded="0"
          @click="openSetting"
        ></v-btn> -->
        <v-btn
          :icon="setting.pin?'mdi-pin-off':'mdi-pin'"
          size="small"
          flat
          variant="text"
          :ripple="false"
          @click="setPin(!setting.pin)"
          rounded="0"
        ></v-btn>
      </div>
    </v-system-bar>
    <v-main
      class="content"
      :class="{'glass':appearance.glass,'d-flex':isColumn}"
    >
      <div
        class="group px-4 pt-3"
        v-for="item,index in showFiles"
        :key="index"
      >
        <div
          class="text-body-2 mb-2"
          :class="{'text-center':isColumn}"
        >{{item.group}}</div>
        <draggable
          v-model="item.children"
          class="d-flex flex-wrap"
          :class="{'flex-column':isColumn}"
          group="shared"
          :swapThreshold="1"
          :animation="100"
          @endEvent="checkEnd"
        >
          <div
            v-for="child in item.children"
            :key="child.id"
            @dblclick="open(child)"
            :data-id="child.id"
            :class="{active:current==child.id}"
            @contextmenu="showMenu($event,child)"
            class="d-flex flex-column align-center justify-center pa-4 grid-item"
          >
            <v-icon
              :size="ICON_SIZE"
              v-if="!child.custom_icon"
            >{{child.icon}}</v-icon>
            <img
              v-else
              :src="child.custom_icon"
              :style="{width:ICON_SIZE+'px',height:ICON_SIZE+'px'}"
            />
            <span class="filename mt-1 text-body-2">{{child.name}}</span>
          </div>
        </draggable>
      </div>

    </v-main>
    <v-menu
      :activator="currentItem"
      v-model="menuShow"
      @update:modelValue="checkState"
      v-if="menuShow"
    >
      <v-card>
        <v-list
          density="compact"
          class="cursor-pointer contextmenu"
        >
          <v-list-item
            density="compact"
            @click="open(select)"
            class="contextmenu-item"
          >打开</v-list-item>
          <v-list-item
            @click="openFather(select)"
            density="compact"
            class="contextmenu-item"
          >父目录</v-list-item>
          <v-list-item
            @click="openIDE(select,'vscode')"
            density="compact"
            v-if="select.type=='文件夹'&&IDE.vscode"
            class="contextmenu-item"
          >vscode</v-list-item>
          <v-list-item
            @click="removeFile(select)"
            density="compact"
            class="contextmenu-item"
          >删除</v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app>
</template>

<script>
// 1.位置与锁定记录
// 2.拖拽改变文件顺序 与分组
// 3.基础设置
import Draggable from '@renderer/components/Draggable.vue'
export default {
  components: { Draggable },
  inject: ['invoke', 'on', 'remove', 'api'],
  data() {
    return {
      // 图标大小
      ICON_SIZE: 36,
      // 文件列表
      files: [],
      // 配置
      setting: {
        layout: '横排',
        pin: false,
        glass: true
      },
      // 显示文件
      showFiles: [],
      // 当前选中的文件id
      current: null,
      // 当前右键聚焦的对象
      currentItem: null,
      // 菜单显示
      menuShow: false,
      // 外观配置
      appearance: {},
      IDE: {}
    }
  },
  computed: {
    // 文件id字典
    file_dic() {
      return this.files.reduce((x, y) => {
        x[y.id] = y
        return x
      }, {})
    },
    // 当前选中
    select() {
      return !this.current ? null : this.file_dic[this.current]
    },
    // 布局
    isColumn() {
      return this.setting.layout == '竖排'
    }
  },
  mounted() {
    // 处理选中 事件
    window.onblur = () => {
      this.current = null
      this.menuShow = false
    }
    window.onclick = (e) => {
      if (!e.target) return
      if (e.target.classList) {
        if (e.target.classList.contains('grid-item')) {
          this.current = parseInt(e.target.dataset.id)
          return
        }
        if (!e.target.parentElement) return
        if (e.target.parentElement.classList.contains('grid-item')) {
          this.current = parseInt(e.target.parentElement.dataset.id)
          return
        }
      }
      this.current = null
    }
    this.remove(this.api.UPDATE.FILE, this.getFileList)
    this.remove(this.api.UPDATE.CONFIG, this.getConfig)
    this.on(this.api.UPDATE.FILE, this.getFileList)
    this.on(this.api.UPDATE.CONFIG, this.getConfig)
    this.getConfig()
    this.getFileList()
  },
  methods: {
    // 配置获取
    async getConfig() {
      let config = await this.invoke(this.api.SYSTEM.GET_CONFIG)
      this.setting = config.file_window_custom
      this.appearance = config.appearance
      this.IDE = config.IDE
      let body = document.body
      for (let key in config.appearance) {
        body.style.setProperty(key, config.appearance[key])
      }
    },
    // 菜单隐藏时清空选中 不然会v-mnue计算位置并报错
    checkState(value) {
      if (!value) {
        this.menuShow = false
        this.$nextTick(() => {
          this.currentItem = null
        })
      }
    },
    // 获取文件列表
    async getFileList() {
      let res = await this.invoke(this.api.FILE.GET_FILE_LIST)
      if (res.status) {
        this.files = res.data
        let group = {}
        this.files.forEach((item) => {
          if (!group[item.group]) {
            group[item.group] = []
          }
          group[item.group].push(item)
        })
        this.showFiles = Object.keys(group).map((x) => {
          return {
            group: x,
            children: group[x].sort((a, b) => a.order - b.order)
          }
        })
      }
    },
    // 显示菜单
    showMenu(event, child) {
      this.currentItem = event.target
      this.current = child.id
      this.menuShow = true
    },
    // 设置固定状态
    setPin(pin) {
      this.setting.pin = pin
      this.setSetting()
    },
    // 设置配置
    setSetting() {
      this.invoke(this.api.FILE_WINDOW.SET_SETTING, this.setting)
    },
    // 打开文件
    open(child) {
      this.invoke(this.api.FILE.OPEN_FILE, child)
    },
    // 打开父对象目录
    openFather(child) {
      this.invoke(this.api.FILE.OPEN_FILE, {
        path: child.path.substring(0, child.path.lastIndexOf('\\'))
      })
    },
    // 删除文件
    removeFile(child) {
      this.invoke(this.api.FILE.DELETE_FILES, [child.id])
      this.getFileList()
    },
    // 拖动结束更新数据
    checkEnd(evt) {
      let dom = document.querySelector('.content')
      let children = dom.children
      let update = []
      for (let item of children) {
        let group_name = item.querySelector('.group-name').innerHTML
        let childs = item.querySelectorAll('.grid-item')
        childs.forEach((child, index) => {
          let id = child.dataset.id
          update.push({
            ...this.file_dic[id],
            group: group_name,
            order: index
          })
        })
      }
      // console.log(update);
      this.invoke(this.api.FILE.EDIT_FILES, update)
    },
    // 使用IDE打开
    openIDE(child, key) {
      this.invoke(this.api.FILE.OPEN_IDE, `"${this.IDE[key]}" "${child.path}"`)
    }
  }
}
</script>

<style lang="scss" scoped>
$radius: 10px;
$w: 90px;
.file {
  border-radius: $radius;
  overflow: hidden;
  .title {
    border-radius: $radius $radius 0 0 !important;
  }
  .group {
    .grid-item {
      flex: 1;
      min-width: $w;
      min-height: $w;
      cursor: pointer;
      &:hover {
        background-color: var(--file-item-hover) !important;
      }
      .filename {
        width: 100%;
        // font-size: 12px;
        // 名字过长隐藏
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
      }
    }
  }
  .active {
    background-color: var(--file-item-hover) !important;
  }
}
</style>