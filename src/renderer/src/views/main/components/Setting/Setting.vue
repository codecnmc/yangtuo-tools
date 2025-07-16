<!--
 * @Author: 羊驼
 * @Date: 2025-06-17 09:45:15
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 11:45:47
 * @Description: 设置
-->
<template>
  <div>
    <v-tabs v-model="active">
      <v-tab value="系统">系统</v-tab>
      <v-tab value="通用外观">通用外观</v-tab>
      <v-tab value="文件窗口外观">文件窗口外观</v-tab>
      <v-tab value="脚本控制台外观">脚本控制台外观</v-tab>
      <v-tab value="IDE配置">IDE配置</v-tab>
    </v-tabs>
    <v-tabs-window v-model="active">
      <v-tabs-window-item
        value="系统"
        class="py-4 mb-4"
      >
        <v-card-subtitle class="d-flex justify-space-between text-h6"> 系统配置 </v-card-subtitle>
        <div class="px-4 pt-2 mb-2">
          <v-checkbox
            label="开机自启动"
            hide-details
            density="compact"
            class="mr-4"
            v-model="config.run"
            @update:modelValue="setConfig"
          />
        </div>
        <v-card-subtitle class="d-flex justify-space-between text-h6"> 脚本配置 </v-card-subtitle>
        <div class="px-4 pt-2">
          <div class="d-flex mb-4">
            <!-- <v-checkbox
              label="开机自启动"
              hide-details
              density="compact"
              class="mr-4"
              v-model="config.run"
              @update:modelValue="setConfig"
            /> -->
            <v-checkbox
              label="终端启动运行"
              hide-details
              density="compact"
              class="mr-4"
              v-model="config.immediately"
              @update:modelValue="setConfig"
            />
            <v-checkbox
              label="终端顺序运行"
              hide-details
              density="compact"
              v-model="config.order"
              @update:modelValue="setConfig"
              class="mr-4"
            />
            <!-- <v-checkbox
              label="终端控制台运行打开"
              hide-details
              v-model="config.terminal"
              @update:modelValue="setConfig"
              density="compact"
            /> -->
          </div>
        </div>
        <v-card-subtitle class="d-flex justify-space-between text-h6"> 显示设置 </v-card-subtitle>
        <div class="px-4 pt-2">
          <v-alert
            text="设置屏幕位置会清空记录的位置数据"
            density="compact"
            class="mb-4"
          ></v-alert>
          <div
            v-for="item in windows"
            :key="item.value"
          >
            <div>{{ item.label }}</div>

            <div class="d-flex">
              <v-checkbox
                label="默认显示"
                hide-details
                density="compact"
                v-model="config.windows[item.value].show"
                @update:modelValue="setConfig"
                class="mr-4 pb-4"
              />

              <v-checkbox
                label="位置记录"
                hide-details
                density="compact"
                v-model="config.windows[item.value].record"
                @update:modelValue="setConfig"
                class="mr-4 pb-4"
              />
              <v-autocomplete
                label="唤醒快捷键"
                :items="shortcutOptions"
                v-model="config.windows[item.value].shortcut"
                density="compact"
                variant="outlined"
                clearable
                @update:modelValue="setConfig"
                class="mr-4"
              ></v-autocomplete>
              <v-select
                label="显示屏幕"
                :items="displays"
                item-title="label"
                item-value="value"
                v-model="config.windows[item.value].display"
                density="compact"
                variant="outlined"
                @update:modelValue="setConfig"
              ></v-select>
            </div>
          </div>

          <v-btn
            color="error"
            block
            class="mt-4"
            @click="clearData"
          >数据清空</v-btn>
          <v-btn
            color="warning"
            block
            class="mt-4"
            @click="restore"
          >恢复默认设置</v-btn>
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item
        value="通用外观"
        class="py-4 mb-4"
      >
        <div v-if="config&&config.appearance">
          <v-checkbox
            v-model="config.appearance.glass"
            label="启用毛玻璃"
            hide-details
            density="compact"
            @update:modelValue="setConfig"
          ></v-checkbox>
          <color-picker
            v-model:color="config.appearance['--main-background']"
            label="窗体背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--background-color']"
            label="内容背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--background-hover-color']"
            label="内容聚焦背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--title-color']"
            label="标题颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--title-hover-color']"
            label="聚焦标题颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--font-color']"
            label="文字颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--font-hover-color']"
            label="聚焦文本颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--scroll-track']"
            label="滑动栏背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--scroll-thumb']"
            label="滑动栏按钮颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--side-bar-background']"
            label="侧边栏背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--side-bar-color']"
            label="侧边栏文字颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--side-bar-active-bg']"
            label="侧边栏选中背景颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />
          <color-picker
            v-model:color="config.appearance['--side-bar-acitve-color']"
            label="侧边栏选中文字颜色"
            class="mt-4"
            @update:modelValue="setConfig"
          />

          <div class="mt-4">
            <div>毛玻璃背景图：</div>
            <img
              class="mt-2 cursor-pointer"
              style="width:256px;height:128px;object-fit:cover"
              @click="selectBg"
              :src="bgPath"
            />
          </div>
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item
        value="文件窗口外观"
        class="py-4 mb-4"
      >
        <v-select
          v-if="config&&config.file_window_custom"
          v-model="config.file_window_custom.layout"
          label="文件内容布局"
          hide-details
          density="compact"
          :items="['横排','竖排']"
          variant="outlined"
          class="mt-2"
          @update:modelValue="setConfig"
        >
        </v-select>

        <color-picker
          v-model:color="config.appearance['--file-item-hover']"
          label="经过文件颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
        <color-picker
          v-model:color="config.appearance['--contextmenu-bg']"
          label="菜单背景颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
        <color-picker
          v-model:color="config.appearance['--contextmenu-item-hover']"
          label="菜单项经过颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
        <color-picker
          v-model:color="config.appearance['--contextmenu-item-font']"
          label="菜单项文字颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
        <color-picker
          v-model:color="config.appearance['--contextmenu-item-font-hover']"
          label="菜单项文字经过颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
      </v-tabs-window-item>
      <v-tabs-window-item
        value="脚本控制台外观"
        class="py-4 mb-4"
      >

        <color-picker
          v-model:color="config.appearance['--drawer-bg']"
          label="菜单背景颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />
        <color-picker
          v-model:color="config.appearance['--drawer-font']"
          label="菜单文字颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-bg']"
          label="控制台背景颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-font']"
          label="控制台文字颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-scroll-bg']"
          label="控制台滚动条背景颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-scroll-thumb']"
          label="控制台滚动条滑块颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--error-text']"
          label="错误文字颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-border']"
          label="控制台边框颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-title-bg']"
          label="控制台标题背景颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

        <color-picker
          v-model:color="config.appearance['--console-title-font']"
          label="控制台标题文字颜色"
          class="mt-4"
          @update:modelValue="setConfig"
        />

      </v-tabs-window-item>
      <v-tabs-window-item
        value="IDE配置"
        class="py-4 mb-4"
      >
        <v-text-field
          label="VsCode路径"
          readonly
          persistent-placeholder
          placeholder="VsCode路径"
          @click.stop="openDialog('vscode')"
          class="mb-4"
          variant="outlined"
          density="compact"
          hide-details
          v-model="config.IDE.vscode"
        ></v-text-field>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script>
import ColorPicker from '@renderer/components/ColorPicker/ColorPicker.vue'
export default {
  components: { ColorPicker },
  inject: ['invoke', 'message', 'api', 'on', 'remove', 'showConfirm'],
  data() {
    return {
      // 屏幕列表
      displays: [],
      // 当前tab显示
      active: '系统',
      // 背景图片
      bgPath: 'data:image/png;base64,' + window.bgPath()
    }
  },
  computed: {
    // 配置显示 但是set不触发
    config: {
      get() {
        return this.$store.config
      },
      set(value) {
        this.$store.config = value
        this.setConfig()
      }
    },
    // 窗口列表
    windows() {
      // console.log(this.config.windows)
      if (!this.config.windows) return []
      return [
        {
          label: '主程序窗口',
          value: 0
        },
        {
          label: '文件窗口',
          value: 2
        },
        {
          label: '终端窗口',
          value: 1
        }
      ]
    },
    // 快捷键列表项
    shortcutOptions() {
      let { show, desktop_file, desk_terminal } = this.config
      let set = new Set([show, desk_terminal, desktop_file])
      let options = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].filter(
        (x) => !set.has(x)
      )
      // alt +a-z
      for (let i = 0; i < 26; i++) {
        let key = `Alt+${String.fromCharCode(65 + i)}`
        !set.has(key) && options.push(key)
      }
      return options
    }
  },
  mounted() {
    this.remove(this.api.UPDATE.CONFIG, this.$store.getConfig)
    this.on(this.api.UPDATE.CONFIG, this.$store.getConfig)
    this.getMonitorInfo()
  },
  methods: {
    setConfig() {
      // 设置body属性
      let body = document.body
      for (let key in this.config.appearance) {
        body.style.setProperty(key, this.config.appearance[key])
      }
      this.$store.setConfig()
    },
    // 获取屏幕情况
    getMonitorInfo() {
      window.electron.ipcRenderer.invoke(this.api.SYSTEM.GET_MONITOR_INFO).then((res) => {
        this.displays = []
        for (let i = 0; i < res.length; i++) {
          this.displays.push({
            value: i,
            label: `屏幕${i + 1}`
          })
        }
      })
    },
    // 恢复默认配置
    restore() {
      this.showConfirm({
        title: '询问',
        content: '是否恢复默认数据？',
        submit: async (done) => {
          await this.invoke(this.api.SYSTEM.CONFIG_RESTORE)
          done()
          this.refreshBg()
        }
      })
    },
    // 清除数据
    clearData() {
      this.showConfirm({
        title: '询问',
        content: '是否清空所有数据？当前运行的脚本会关闭。',
        submit: async (done) => {
          localStorage.clear()
          await this.invoke(this.api.SYSTEM.CLEAR_DATA)
          done()
        }
      })
    },
    // 选择新的背景
    async selectBg() {
      let result = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
        title: '选择文件',
        message: '请选择文件',
        filters: [
          {
            name: '图片',
            // 图片
            extensions: ['png']
          }
        ]
      })
      if (!result.canceled) {
        let path = result.filePaths[0]
        this.invoke(this.api.SYSTEM.CHANGE_BACKGROUND, path).then(() => {
          this.refreshBg()
        })
      }
    },
    // 刷新背景
    refreshBg() {
      this.bgPath = 'data:image/png;base64,' + window.bgPath()
    },
    // 打开文件选取
    async openDialog(key) {
      this.loading = true
      let result = await this.invoke(this.api.SYSTEM.GET_OPEN_DIALOG, {
        title: '选择文件',
        message: '请选择文件',
        filters: [
          {
            name: '可执行文件',
            extensions: ['exe']
          }
        ]
      })
      this.loading = false
      if (!result.canceled) {
        let path = result.filePaths[0]
        let name = path.substring(path.lastIndexOf('\\') + 1)
        switch (key) {
          case 'vscode':
            if (name != 'Code.exe') {
              return this.message({ type: 'error', message: '无效应用名' })
            }
            this.config.IDE.vscode = path
            this.setConfig()
            break
        }
      }
    }
  }
}
</script>