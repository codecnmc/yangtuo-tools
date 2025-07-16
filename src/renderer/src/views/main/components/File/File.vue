<!--
 * @Author: 羊驼
 * @Date: 2025-05-30 16:23:58
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 10:19:18
 * @Description: 文件管理
-->
<template>
  <div>
    <v-card
      class="card"
      flat
    >
      <v-card-title class="d-flex justify-space-between">
        <span>常用文件列表</span>

        <div class="d-flex align-center">

          <v-switch
            label="分组显示"
            v-model="group"
            inline
            hide-details
            density="compact"
            color="info"
            class="mr-2"
          />
          <v-btn
            color="success"
            size="small"
            class="mr-2"
            :loading="loading"
            @click="openDesktop"
          >
            <template v-slot:prepend>
              <v-icon left>mdi-monitor</v-icon>
            </template>
            桌面工作区</v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="open('create')"
            :loading="loading"
          >
            <template v-slot:prepend>
              <v-icon left>mdi-plus</v-icon>
            </template>
            添加快捷启动</v-btn>
        </div>

      </v-card-title>
      <div
        class="pl-4"
        v-if="selects.length"
      >
        <!-- TODO 批量更改分组 批量编辑 -->
        <v-btn
          color="warning"
          size="small"
          class="mr-2"
          @click="open('edit', selects)"
          :loading="loading"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-pencil</v-icon>
          </template>
          编辑</v-btn>
        <v-btn
          color="error"
          size="small"
          class="mr-2"
          @click="removeFile(null, true)"
          :loading="loading"
        >
          <template v-slot:prepend>
            <v-icon left>mdi-delete</v-icon>
          </template>
          删除</v-btn>
      </div>
      <v-card-text>
        <v-data-table
          border
          :items="files"
          density="compact"
          fixed-header
          hide-default-footer
          v-model="selects"
          return-object
          :items-per-page="-1"
          disable-sort
          :headers="headers"
          style="max-height: 70vh"
          show-select
          item-value="name"
          no-data-text="暂无数据"
          :group-by="group?[{key:'group',order:'asc'}]:[]"
          :sort-by="[{key:'order',order:'asc'}]"
        >
          <template #header.data-table-group="{item}">
            分组
          </template>
          <template #item.data-table-group="{item}">
            <div
              class="text-truncate"
              :title="item.name"
            >{{item.name}}</div>
          </template>
          <template #item.path="{ item }">
            <div
              class="text-truncate"
              :title="item.path"
            >{{item.path}}</div>
          </template>
          <template #item.icon="{ item }">
            <v-icon v-if="!item.custom_icon">{{ item.icon }}</v-icon>
            <img
              v-else
              :src="item.custom_icon"
              style="width:32px;height:32px"
            />
          </template>
          <template #item.control="{ item }">
            <v-btn
              size="mini"
              color="success"
              :loading="loading"
              @click="openFile(item)"
              flat
            ><v-icon>mdi-play</v-icon></v-btn>
            <v-btn
              size="mini"
              flat
              class="ml-2"
              color="warning"
              @click="open('edit',[item])"
              :loading="loading"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              size="mini"
              flat
              class="ml-2"
              color="error"
              :loading="loading"
              @click="removeFile(item, false)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="visible"
      width="650px"
    >
      <v-card>
        <v-card-title>{{ mode == 'create' ? '添加快捷启动项' : '编辑快捷启动项' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <template v-if="mode=='create'">
              <div class="d-flex">
                <div>选择类型：</div>
                <v-radio-group
                  v-model="type"
                  inline
                  density="compact"
                >
                  <v-radio
                    label="文件"
                    class="mr-2"
                    value="openFile"
                  ></v-radio>
                  <v-radio
                    label="目录"
                    value="openDirectory"
                  ></v-radio>
                </v-radio-group>
              </div>
              <div class="zone">
                <dropzone @end="zoneDrop" />
              </div>
              <v-text-field
                label="文件选择"
                readonly
                persistent-placeholder
                placeholder="请选择文件路径（可多选）"
                @click.stop="openDialog(null)"
                class="mb-4"
                variant="outlined"
                density="compact"
                :loading="loading"
                hide-details
              ></v-text-field>
            </template>
            <div class="files">
              <div v-for="item,index in form">
                <!-- <v-icon>{{item.icon}}</v-icon> -->
                <div
                  class="mb-2"
                  v-if="mode=='create'"
                >文件{{index+1}}</div>
                <div class="custom-icon mb-2">
                  <span>自定义图标：</span>
                  <v-icon
                    size="32"
                    color="success"
                    class="cursor-pointer"
                    @click="openDialog(item,'custom_icon')"
                  >mdi-plus</v-icon>

                  <v-icon
                    size="24"
                    color="error"
                    class="cursor-pointer float-right"
                    @click="deleteFile(index)"
                    v-if="mode=='create'"
                  >mdi-close</v-icon>
                </div>
                <div
                  v-if="item.custom_icon"
                  class="mb-4"
                >
                  <img
                    :src="item.custom_icon"
                    style="width:32px;height:32px"
                  />
                </div>
                <!-- <v-image
                  label="自定义图标"
                  class="mb-4"
                  variant="outlined"
                  hide-details
                  density="compact"
                  @click="openDialog(item,'custom_icon')"
                  :loading="loading"
                ></v-image> -->
                <v-text-field
                  label="快捷启动项名称"
                  v-model="item.name"
                  clearable
                  persistent-placeholder
                  placeholder="请输入快捷启动项名称"
                  :rules="[(v) => !!v || '名称不能为空']"
                  class="mb-4"
                  density="compact"
                  variant="outlined"
                  :loading="loading"
                  :append-inner-icon="!item.custom_icon?item.icon:''"
                  hide-details
                ></v-text-field>
                <v-textarea
                  :rows="1"
                  label="路径"
                  v-model="item.path"
                  class="mb-4"
                  variant="outlined"
                  hide-details
                  density="compact"
                  readonly
                  no-resize
                  auto-grow
                  @click="openDialog(item)"
                  :rules="[(v) => !!v || '路径不能为空']"
                  :loading="loading"
                ></v-textarea>
                <v-combobox
                  label="分组"
                  v-model="item.group"
                  clearable
                  :items="getGroup"
                  persistent-placeholder
                  placeholder="请输入分组名称"
                  class="mb-4"
                  no-data-text="暂无分组"
                  density="compact"
                  variant="outlined"
                  :loading="loading"
                  :rules="[(v) => !!v || '名称不能为空']"
                  hide-details
                ></v-combobox>

              </div>
            </div>
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
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Dropzone from '@renderer/components/Dropzone.vue'
export default {
  components: { Dropzone },
  inject: ['invoke', 'message', 'showConfirm', 'api', 'on', 'remove'],
  data() {
    return {
      // 表单项
      form: [],
      // 文件列表
      files: [],
      // 编辑框显示
      visible: false,
      // 编辑框模式
      mode: 'create',
      // 当前选择
      selects: [],
      // 加载状态
      loading: false,
      // 文件添加选择模式
      type: 'openFile',
      // 是否以组的方式显示
      group: true
    }
  },
  computed: {
    // 获取分组
    getGroup() {
      let group = new Set(this.files.map((x) => x.group))
      for (let item of this.form) {
        if (item.group) {
          group.add(item.group)
        }
      }
      return [...group]
    },
    // 动态表头
    headers() {
      let h = [
        {
          title: '图标',
          value: 'icon'
        },
        {
          title: '名称',
          value: 'name'
        },
        {
          title: '类型',
          value: 'type',
          width: '100px'
        },
        {
          title: '路径',
          value: 'path',
          maxWidth: '200px'
        },
        // {
        //   title: '分组',
        //   value: 'group'
        // },
        {
          title: '操作',
          value: 'control',
          width: '100px'
        }
      ]
      if (this.group) {
        h.splice(1, 1)
      }
      return h
    }
  },
  mounted() {
    this.remove(this.api.UPDATE.FILE, this.getFileList)
    this.on(this.api.UPDATE.FILE, this.getFileList)
    this.getFileList()
  },
  methods: {
    // 获取文件列表
    async getFileList() {
      let res = await this.invoke(this.api.FILE.GET_FILE_LIST)
      if (res.status) {
        this.files = res.data
      }
    },
    // 打开编辑框
    open(mode, array = []) {
      this.mode = mode
      this.form = JSON.parse(JSON.stringify(array))
      this.visible = true
    },
    // 打开文件选取
    async openDialog(target, key = 'path') {
      this.loading = true
      let properties = [this.type]
      if (!target) {
        properties.push('multiSelections')
      }
      let filters = []
      if (key == 'custom_icon') {
        // 自定义图标
        filters.push({
          name: '图标文件',
          // 图片
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico']
        })
      }
      let result = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
        title: '选择文件',
        message: '请选择文件',
        properties,
        filters
      })
      this.loading = false
      if (!result.canceled) {
        let exist = new Set([...this.form.map((x) => x.path), ...this.files.map((x) => x.path)])
        let paths = result.filePaths.filter((x) => !exist.has(x))
        if (!paths.length) {
          return this.message({ type: 'error', message: '该路径已存在' })
        }
        if (!target) {
          this.form = this.form.concat(
            paths.map((x) => {
              let name = x.substring(x.lastIndexOf('\\') + 1)
              let type = name.indexOf('.') > -1 ? '可执行文件' : '文件夹'
              return {
                path: x,
                name,
                icon: this.getIcon(name, type),
                custom_icon: '',
                group: '未分组',
                type
              }
            })
          )
        } else {
          if (key == 'path') {
            target[key] = paths[0]
            let name = target.path.substring(x.lastIndexOf('\\') + 1)
            let type = name.indexOf('.') > -1 ? '可执行文件' : '文件夹'
            target.icon = this.getIcon(name, type)
            target.type = type
          } else {
            let data = await this.invoke(this.api.SYSTEM.GET_FILE_DATA, paths[0], 'base64')
            target.custom_icon = 'data:image/png;base64,' + data
          }
        }
      }
    },
    // 获取默认图标
    getIcon(name, type) {
      if (type == '文件夹') {
        return 'mdi-folder-outline'
      }
      let suffix = name.substring(name.lastIndexOf('.') + 1)
      switch (suffix) {
        // 图片
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
        case 'webp':
        case 'ico':
          return 'mdi-file-image'
        case 'exe':
          return 'mdi-application-outline'
        // 视频
        case 'mp4':
        case 'avi':
        case 'mkv':
        case 'wmv':
        case 'flv':
        case 'mov':
        case '3gp':
        case 'webm':
        case 'mpeg':
        case 'mpg':
        case 'm4v':
        case 'm2v':
        case 'm1v':
        case 'm3u8':
        case 'm3u':
        case 'ts':
        case 'vob':
        case 'rm':
        case 'rmvb':
        case 'divx':
        case 'xvid':
          return 'mdi-video'
        // 文档类
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
        case 'pdf':
        case 'txt':
        case 'md':
        case 'html':
        case 'css':
        case 'js':
        case 'json':
        case 'xml':
        case 'csv':
        case 'ini':
        case 'log':
        case 'bat':
        case 'sh':
        case 'py':
        case 'java':
        case 'c':
        case 'cpp':
        case 'h':
        case 'hpp':
          return 'mdi-file-document-outline'
        default:
          return 'mdi-file'
      }
    },
    // 提交数据
    async submit() {
      if (!this.form.length) {
        return this.message({ type: 'error', message: '未选中任何文件' })
      }
      const { valid } = await this.$refs.form.validate()
      if (valid) {
        this.loading = true
        let res = null
        if (this.mode == 'create') {
          res = await this.invoke(this.api.FILE.CREATE_FILES, this.form)
        } else {
          res = await this.invoke(this.api.FILE.EDIT_FILES, this.form)
        }
        this.message({ type: res.status ? 'success' : 'error', message: res.message })
        if (res.status) {
          // this.getFileList()
          this.visible = false
        }
        this.loading = false
      } else {
        return this.message({ type: 'error', message: '请将信息补充完整' })
      }
    },
    // 删除文件项
    async removeFile(row, batch = false) {
      let target = batch ? this.selects : [row]
      if (target.length == 0) {
        return this.message({ type: 'error', message: '请选择文件项' })
      }
      this.showConfirm({
        title: '询问',
        content: batch ? `是否要删除选中的${target.length}个文件项` : '是否要删除选中的文件项?',
        submit: async (done) => {
          this.loading = true
          let res = await this.invoke(
            this.api.FILE.DELETE_FILES,
            target.map((x) => x.id)
          )
          this.message({ type: res.status ? 'success' : 'error', message: res.message })
          // res.status && this.getFileList()
          this.loading = false
          this.selects = []
          done()
        }
      })
    },
    // 打开文件
    openFile(item) {
      this.invoke(this.api.FILE.OPEN_FILE, item)
    },
    // 打开桌面工作区
    openDesktop() {
      this.invoke(this.api.FILE.OPEN_FILE_WINDOW)
    },
    // 编辑模式下 删除form里的文件
    deleteFile(index) {
      this.form.splice(index, 1)
    },
    // 放下事件
    zoneDrop(files) {
      let exist = new Set([...this.form.map((x) => x.path), ...this.files.map((x) => x.path)])
      files = files.filter((x) => !exist.has(x.path))
      if (!files.length) {
        return this.message({ type: 'error', message: '未选中任何文件' })
      }
      this.form = this.form.concat(
        files.map(({ path: x }) => {
          let name = x.substring(x.lastIndexOf('\\') + 1)
          let type = name.indexOf('.') > -1 ? '可执行文件' : '文件夹'
          return {
            path: x,
            name,
            icon: this.getIcon(name, type),
            custom_icon: '',
            group: '未分组',
            type
          }
        })
      )
    }
  }
}
</script>