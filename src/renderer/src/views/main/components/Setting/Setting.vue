<!--
 * @Author: 羊驼
 * @Date: 2025-06-17 09:45:15
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-26 16:50:46
 * @Description: 设置
-->
<template>
  <div>
    <v-tabs v-model="active">
      <v-tab value="系统">{{$t('system')}}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="active">
      <v-tabs-window-item
        value="系统"
        class="py-4 mb-4"
        v-if="config.windows"
      >
        <div class="px-4 pt-2 mb-2">
          <v-checkbox
            :label="$t('auto_start')"
            hide-details
            density="compact"
            class="mb-4"
            v-model="config.run"
            @update:modelValue="setConfig"
          />
          <v-autocomplete
            v-model="config.windows[0].shortcut"
            :label="$t('main_shortcut')"
            hide-details
            density="compact"
            :items="shortcutOptions"
            class="mb-4"
            variant="outlined"
            @update:modelValue="setConfig"
          />
          <v-autocomplete
            v-model="config.windows[1].shortcut"
            :label="$t('search_shortcut')"
            hide-details
            density="compact"
            :items="shortcutOptions"
            class="mb-4"
            variant="outlined"
            @update:modelValue="setConfig"
          />
          <v-select
            v-model="config.lang"
            :label="$t('lang')"
            hide-details
            density="compact"
            :items="langList"
            item-title="label"
            item-value="value"
            class="mb-4"
            variant="outlined"
            @update:modelValue="setConfig"
          />
          <v-btn
            color="error"
            class="mr-4"
            @click="clearData"
          >{{$t('restart_clear')}}</v-btn>
          <v-btn
            color="warning"
            @click="restore"
          >{{$t('restore')}}</v-btn>
          <!-- 作者 以及当前版本号 美化一下-->
          <div class="px-2  text-blue-grey text-button position-fixed bottom-0 right-0">
            <span>{{$t('author')}}：羊驼</span>
            <span class="ml-2">{{$t('version')}}：{{version}}</span>
          </div>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script>
export default {
  inject: ['invoke', 'message', 'api', 'on', 'remove', 'showConfirm'],
  data() {
    return {
      active: '系统',
      config: {},
      version: ''
    }
  },
  computed: {
    // 窗口列表
    windows() {
      if (!this.config.windows) return []
      return [
        {
          label: '主程序窗口',
          value: 0
        },
        {
          label: '搜索窗口',
          value: 1
        }
      ]
    },
    // 快捷键列表项
    shortcutOptions() {
      let options = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10']
      // alt +a-z
      for (let i = 0; i < 26; i++) {
        let key = `Alt+${String.fromCharCode(65 + i)}`
        // 大写
        let key2 = `Shift+${String.fromCharCode(65 + i)}`
        options.push(key)
        options.push(key2)
      }
      return options
    },
    langList() {
      let options = []
      for (let key in window.language) {
        options.push({
          label: window.language[key].lang,
          value: key
        })
      }
      return options
    }
  },
  mounted() {
    // 获取版本
    this.invoke(this.api.SYSTEM.GET_VERSION).then((res) => {
      this.version = res
    })

    this.remove(this.api.UPDATE.CONFIG, this.getConfig)
    this.on(this.api.UPDATE.CONFIG, this.getConfig)
    this.getConfig()
  },
  methods: {
    async getConfig() {
      let data = await this.invoke(this.api.SYSTEM.GET_CONFIG)
      this.config = data
      // 设置i18的语言
      this.$i18n.locale = this.config.lang
    },
    async setConfig() {
      await this.invoke(this.api.SYSTEM.SET_CONFIG, JSON.parse(JSON.stringify(this.config)))
    },
    // 恢复默认配置
    restore() {
      this.showConfirm({
        title: this.$t('restore'),
        content: this.$t('restore_confirm'),
        submit: async (done) => {
          await this.invoke(this.api.SYSTEM.CONFIG_RESTORE)
          done()
        }
      })
    },
    // 清除数据
    clearData() {
      this.showConfirm({
        title: this.$t('restart'),
        content: this.$t('restart_confirm'),
        submit: async (done) => {
          localStorage.clear()
          await this.invoke(this.api.SYSTEM.CLEAR_DATA)
          done()
        }
      })
    }
  }
}
</script>