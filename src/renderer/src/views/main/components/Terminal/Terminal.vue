<!--
 * @Author: 羊驼
 * @Date: 2025-06-23 09:03:57
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-17 11:03:15
 * @Description: file content
-->
<template>
  <div>
    <!-- <memory-chart /> -->
    <v-card
      class="card"
      flat
    >
      <v-card-title class="d-flex justify-space-between">
        <span>启动项列表</span>
        <div>
          <v-btn
            color="success"
            size="small"
            class="mr-2"
            :loading="loading"
            @click="invoke(api.SHELL.OPEN_SHELL_WINDOW)"
          >
            <template v-slot:prepend>
              <v-icon left>mdi-monitor</v-icon>
            </template>
            桌面工作区</v-btn>
          <v-btn
            v-if="shells.length > 1"
            color="info"
            class="mr-2"
            size="small"
            :loading="loading"
            @click="openOrder"
          >
            <template v-slot:prepend>
              <v-icon> mdi-order-numeric-ascending</v-icon>
            </template>
            启动顺序调整
          </v-btn>
          <v-btn
            color="success"
            class="mr-2"
            size="small"
            :loading="loading"
            @click="folderSelect"
          >
            <template v-slot:prepend>
              <v-icon left>mdi-folder</v-icon>
            </template>
            文件夹识别
          </v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="openEditor('create')"
            :loading="loading"
          >
            <template v-slot:prepend>
              <v-icon left>mdi-plus</v-icon>
            </template>
            添加启动项</v-btn>
        </div>
      </v-card-title>
      <div
        v-if="selects.length"
        class="pl-4"
      >
        <v-btn
          color="success"
          size="small"
          class="mr-2"
          :loading="loading"
          @click="command(api.SHELL.START_SHELL,null)"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-play</v-icon>
          </template>
          开始</v-btn>
        <v-btn
          color="warning"
          size="small"
          class="mr-2"
          :loading="loading"
          @click="openEditor('edit', selects)"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-pencil</v-icon>
          </template>
          编辑</v-btn>
        <v-btn
          color="#EF5350"
          size="small"
          class="mr-2"
          :loading="loading"
          @click="command(api.SHELL.STOP_SHELL,null)"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-stop</v-icon>
          </template>
          终止</v-btn>
        <v-btn
          color="error"
          size="small"
          class="mr-2"
          @click="removeShell(null, true)"
          :loading="loading"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-delete</v-icon>
          </template>
          删除</v-btn>
      </div>
      <v-card-text>
        <v-data-table
          :items="shells"
          density="compact"
          fixed-header
          hide-default-footer
          :items-per-page="-1"
          disable-sort
          v-model="selects"
          :loading="loading"
          return-object
          :headers="headers"
          style="max-height: 50vh"
          show-select
          no-data-text="暂无数据"
          loading-text="加载中"
        >
          <template #item.path="{ item }">
            <div
              class="text-truncate"
              :title="item.path"
            >{{item.path}}</div>
          </template>
          <template #item.status="{ item }">
            <v-chip
              density="compact"
              :color="calcStatusColor(item.status)"
            >{{ item.status }}</v-chip>
          </template>
          <template #item.enable="{ item }">
            <v-switch
              hide-details
              v-model="item.enable"
              color="info"
              density="compact"
              readonly
            ></v-switch>
          </template>
          <template #item.memory="{ item }"> {{ item.memory }}MB </template>
          <template #item.action="{ item }">
            <v-btn
              size="mini"
              flat
              color="success"
              title="开始"
              :loading="loading"
              v-if="[STATUS.未启动,STATUS.已退出,STATUS.已关闭,STATUS.暂停中,STATUS.已停止].includes(item.status)&&item.enable"
              @click="command(api.SHELL.START_SHELL,item)"
            >
              <v-icon>mdi-play</v-icon>
            </v-btn>
            <template v-if="[STATUS.未启动,STATUS.已退出,STATUS.已关闭,STATUS.已停止].includes(item.status)">

              <v-btn
                size="mini"
                flat
                class="ml-2"
                color="warning"
                title="编辑"
                :loading="loading"
                @click="openEditor('edit', [item])"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                size="mini"
                flat
                class="ml-2"
                color="error"
                :loading="loading"
                title="删除"
                @click="removeShell(item, false)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                size="mini"
                flat
                color="error"
                title="终止"
                :loading="loading"
                @click="command(api.SHELL.STOP_SHELL,item)"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>

            </template>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <editor-dialog
      ref="editor"
      @clear="selects=[]"
    />
    <order-dialog ref="order" />
  </div>
</template>
<script>
import EditorDialog from './components/EditorDialog.vue'
import OrderDialog from './components/OrderDialog.vue'
export default {
  inject: ['invoke', 'message', 'showConfirm', 'api', 'on', 'remove'],
  components: { EditorDialog, OrderDialog },
  data() {
    return {
      // 选中的启动项
      selects: [],
      // 表头
      headers: [
        {
          title: '名称',
          value: 'name',
          width: '150px'
        },
        {
          title: '启用状态',
          value: 'enable',
          width: '150px'
        },
        {
          title: '路径',
          value: 'path',
          maxWidth: '200px',
          minWidth: '100px'
        },
        {
          title: '状态',
          value: 'status',
          width: '100px'
        },
        {
          title: '内存占用',
          value: 'memory',
          width: '150px'
        },
        {
          title: '操作',
          value: 'action',
          width: '150px'
        }
      ],
      // 防抖loading
      loading: false,
      // 获取脚本列表定时器
      interval: null
    }
  },
  computed: {
    // 脚本列表
    shells() {
      return this.$store.shells
    },
    // 脚本状态枚举
    STATUS() {
      return this.$store.STATUS
    }
  },
  beforeMount() {
    this.remove(this.api.UPDATE.SHELL, this.$store.getShellList)
    this.on(this.api.UPDATE.SHELL, this.$store.getShellList)
    this.$store.getShellList()
    this.interval = setInterval(() => {
      this.$store.getShellList()
    }, 2000)
  },
  beforeUnmount() {
    clearInterval(this.interval)
  },
  methods: {
    // 打开编辑框
    openEditor(mode, array) {
      if (mode == 'edit') {
        array = array.filter((x) => x.status != this.$store.STATUS.运行中)
        if (!array.length) {
          return this.message({ type: 'error', message: '请选择未启动的项' })
        }
      }
      this.$refs.editor.open(mode, array)
    },
    // 打开启动顺序编辑
    openOrder() {
      this.$refs.order.open()
    },
    // 开启终端
    async command(command, row) {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        // console.log(1)
      }, 1500)
      if (row) {
        await this.invoke(command, row.id)
        return
      }
      for (let item of this.selects) {
        await this.invoke(command, item.id)
      }
      this.selects = []
    },
    // 删除启动项
    async removeShell(row, batch = false) {
      let target = batch ? this.selects : [row]
      let STATUS = this.STATUS
      let STATUS_SET = new Set([STATUS.未启动, STATUS.已停止, STATUS.已退出])
      target = target.filter((x) => STATUS_SET.has(x.status))
      if (target.length == 0) {
        return this.message({ type: 'error', message: '请选择未启动的项' })
      }
      this.showConfirm({
        title: '询问',
        content: batch ? `是否要删除选中的${target.length}个启动项` : '是否要删除选中的启动项?',
        submit: async (done) => {
          this.loading = true
          let res = await this.invoke(
            this.api.SHELL.DELETE_SHELL,
            target.map((x) => x.id)
          )
          this.message({ type: res.status ? 'success' : 'error', message: res.message })
          res.status && this.$store.getShellList()
          this.loading = false
          this.selects = []
          done()
        }
      })
    },
    // 识别文件下的文件数据
    async folderSelect() {
      this.loading = true
      let result = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
        title: '选择文件',
        message: '请选择文件',
        properties: ['openDirectory']
      })
      if (!result.canceled) {
        let list = []
        let path = result.filePaths[0]
        let files = await this.invoke(this.api.SYSTEM.GET_FOLDER_FILE_LIST, path)
        let set = new Set(this.$store.EXE_OPTIONS)
        let exist = new Set(this.shells.map((x) => x.path))
        for (let item of files) {
          let suffix = item.substring(item.lastIndexOf('.') + 1)
          let right = set.has(suffix)
          let fullpath = `${path}\\${item}`
          if (!exist.has(fullpath) && right) {
            list.push({ name: item, path: fullpath, enable: true })
          }
        }
        if (!list.length) {
          this.loading = false
          return this.message({ type: 'info', message: '该目录下没有可执行文件或者路径已经存在' })
        }
        this.openEditor('create', list)
      }
      this.loading = false
    },
    // 获取对应状态的chip显示颜色
    calcStatusColor(status) {
      let STATUS = this.STATUS
      switch (status) {
        case STATUS.运行中:
          return 'success'
        case STATUS.已停止:
        case STATUS.已退出:
          return 'error'
        default:
          return 'info'
      }
    }
  }
}
</script>