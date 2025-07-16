<!--
 * @Author: 羊驼
 * @Date: 2025-06-18 16:40:30
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-15 15:48:31
 * @Description: 主界面
-->
<template>
  <v-app>
    <div
      class="page"
      :class="{bg:appearance.glass}"
    >
      <v-system-bar
        window
        class="title"
        :class="{glass:appearance.glass}"
      >
        <img
          :src="logo"
          style="width:16px;height:16px"
          class="mr-2"
        />

        <span>羊驼的工具箱</span>
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
        :class="{glass:appearance.glass}"
      >
        <v-list
          v-model:selected="active"
          nav
          mandatory
        >
          <v-list-item
            v-for="(item, i) in menus"
            :key="i"
            :value="item.text"
            color="primary"
          >
            <v-list-item-title>
              <v-icon class="mr-2">{{ item.icon }}</v-icon>
              {{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main >
        <v-container
          class="px-6 mx-0 content"
          :class="{glass:appearance.glass}"
        >
          <div v-show="current == menus[0].text">
            <Terminal />
          </div>
          <div v-show="current == menus[1].text">
            <File />
          </div>
          <!-- <div v-show="current == menus[2].text">
          <Log />
        </div> -->
          <div v-show="current == menus[2].text">
            <Setting />
          </div>
        </v-container>
      </v-main>
      <messages v-model="messages" />
      <v-dialog
        v-model="confirm.visible"
        width="400px"
      >
        <v-card>
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
            >取消</v-btn>
            <v-btn
              color="primary"
              @click="confirm.submit"
            >确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script>
import Terminal from './components/Terminal/Terminal.vue'
import File from './components/File/File.vue'
import Log from './components/Log/Log.vue'
import Setting from './components/Setting/Setting.vue'
import logo from '@resources/pictures/icon.png?asset&asarUnpack'
import Messages from '../../components/Messages.vue'
export default {
  inject: ['invoke', 'api'],
  components: { Terminal, File, Log, Setting, Messages },
  data() {
    return {
      logo,
      // 当前菜单选中项
      active: ['脚本'],
      // 菜单渲染
      menus: [
        {
          text: '脚本',
          icon: 'mdi-console'
        },
        {
          text: '文件管理器',
          icon: 'mdi-folder'
        },
        // {
        //   text: '日志',
        //   icon: 'mdi-clipboard-outline'
        // },
        {
          text: '设置',
          icon: 'mdi-cog'
        }
      ],
      // 消息
      messages: [],
      // 确认配置
      confirm: {
        visible: false,
        title: '测试',
        content: '测试内容',
        close: () => {},
        submit: () => {}
      }
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
      }
    }
  },
  computed: {
    // 当前菜单
    current() {
      return this.active[0]
    },
    // 外观配置
    appearance() {
      return (this.$store.config && this.$store.config.appearance) || { appearance: {} }
    }
  },
  beforeCreate() {
    this.$store.getConfig()
  }
}
</script>