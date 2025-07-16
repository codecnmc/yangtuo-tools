<template>
  <v-dialog
    v-model="visible"
    width="650px"
  >
    <v-card>
      <v-card-title>{{ mode == 'create' ? '启动项创建' : '启动项编辑' }}</v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          :disabled="loading"
        >
          <v-text-field
            label="文件选择"
            readonly
            v-if="mode=='create'"
            persistent-placeholder
            placeholder="请选择文件路径（可多选）"
            @click.stop="openDialog(null)"
            class="mb-4"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
          <div
            class="zone"
            v-if="mode=='create'"
          >
            <dropzone @end="zoneDrop" />
          </div>
          <div class="terminals pr-4">
            <draggable
              handle=".mdi-drag"
              v-model="form"
            >
              <div
                v-for="item,index in form"
                :key="index"
                class="pl-4 terminal-item"
              >
                <h4 class="mb-4 d-flex align-center justify-space-between">
                  <span>
                    <v-icon
                      class="cursor-pointer mr-2"
                      v-if="form.length>1"
                    >mdi-drag</v-icon>
                    <span>启动项{{index+1}}</span>
                  </span>
                  <v-icon
                    v-if="mode=='create'"
                    color="error"
                    @click="deleteItem(index)"
                    class="cursor-pointer ml-2"
                  >mdi-close</v-icon>
                </h4>
                <v-text-field
                  label="名称"
                  v-model="item.name"
                  clearable
                  persistent-placeholder
                  placeholder="请输入启动项名称"
                  :rules="[(v) => !!v || '名称不能为空']"
                  class="mb-4"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
                <div class="d-flex align-center mb-4">
                  <span class="mr-4">启用状态</span>
                  <v-switch
                    hide-details
                    v-model="item.enable"
                    color="info"
                    density="compact"
                  ></v-switch>
                </div>
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
                ></v-textarea>
              </div>
            </draggable>
          </div>
          <div
            class="d-flex"
            v-if="mode=='create'"
          >
            <v-checkbox
              v-model="terminals.immediately"
              label="立即启动"
              hide-details
              density="compact"
            ></v-checkbox>
            <v-checkbox
              v-model="terminals.order"
              label="顺序启动"
              class="ml-4"
              hide-details
              density="compact"
            ></v-checkbox>
            <!-- <v-checkbox
              v-model="terminals.terminal"
              label="控制台显示"
              class="ml-4"
              hide-details
              density="compact"
            ></v-checkbox> -->
          </div>
        </v-form>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            flat
            :loading="loading"
            @click="visible = false"
          >关闭</v-btn>
          <v-btn
            color="primary"
            class="ml-4"
            :loading="loading"
            @click="submit"
          >提交</v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Draggable from '@renderer/components/Draggable.vue'
import Dropzone from '@renderer/components/Dropzone.vue'
export default {
  emits: ['clear'],
  inject: ['message', 'invoke', 'api'],
  components: { Draggable, Dropzone },
  data() {
    return {
      // 防抖
      loading: false,
      // 创建 编辑启动项的dialog 显示标志位
      visible: false,
      // 创建与修改配置项
      terminals: {
        // 立即启动
        immediately: false,
        // 顺序启动
        order: false,
        // 控制台显示
        // terminal: false
      },
      // 表单
      form: [],
      // 创建或编辑模式
      mode: 'create'
    }
  },
  computed: {
    shells() {
      return this.$store.shells
    }
  },
  methods: {
    // 打开对话框
    open(mode, array = []) {
      this.mode = mode
      this.terminals = {
        immediately: false,
        order: false,
        terminal: false
      }
      this.form = JSON.parse(JSON.stringify(array))
      this.visible = true
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
          res = await this.invoke(this.api.SHELL.CREATE_SHELL, this.form, this.terminals)
        } else {
          res = await this.invoke(this.api.SHELL.EDIT_SHELL, this.form, this.terminals)
        }
        this.message({ type: res.status ? 'success' : 'error', message: res.message })
        if (res.status) {
          // this.$store.getShellList()
          this.visible = false
        }
        this.loading = false
        this.$emit('clear')
      } else {
        return this.message({ type: 'error', message: '请将信息补充完整' })
      }
    },
    // 打开文件选取
    async openDialog(target) {
      this.loading = true

      let properties = []
      if (!target) {
        properties.push('multiSelections')
      }
      let result = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
        title: '选择文件',
        message: '请选择文件',
        properties,
        filters: [
          {
            name: '可执行文件',
            extensions: this.$store.EXE_OPTIONS
          }
        ]
      })
      this.loading = false
      //   console.log(result)
      if (!result.canceled) {
        let exist = new Set([...this.form.map((x) => x.path), ...this.shells.map((x) => x.path)])
        let paths = result.filePaths.filter((x) => !exist.has(x))
        if (!paths.length) {
          return this.message({ type: 'error', message: '该路径已存在' })
        }
        if (!target) {
          this.form = this.form.concat(
            paths.map((x) => {
              let name = x.substring(x.lastIndexOf('\\') + 1)
              return {
                path: x,
                name,
                enable: true
              }
            })
          )
        } else {
          target.path = paths[0]
        }
      }
      // console.log(result)
    },
    // 创建模式下删除多余的启动项
    deleteItem(index) {
      this.form.splice(index, 1)
    },
    // 放下事件
    zoneDrop(files) {
      let exist = new Set([...this.form.map((x) => x.path), ...this.shells.map((x) => x.path)])
      files = files.filter(({ path: x }) => {
        let suffix = x.substring(x.lastIndexOf('.') + 1)
        return !exist.has(x) && this.$store.EXE_OPTIONS.includes(suffix)
      })
      if (!files.length) {
        return this.message({ type: 'error', message: '未选中任何文件' })
      }
      this.form = this.form.concat(
        files.map(({ path: x }) => {
          let name = x.substring(x.lastIndexOf('\\') + 1)
          return {
            path: x,
            name,
            enable: true
          }
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.terminals {
  max-height: 50vh;
  overflow: auto;
}
</style>