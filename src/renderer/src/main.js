/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-26 10:25:03
 * @Description: main.js
 */
import '@resources/styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import router from "./router/index.js"
import useStore from './store/index.js'
import { createI18n } from "vue-i18n";
import api from '@resources/js/api'

let messages = await window.electron.ipcRenderer.invoke(api.SYSTEM.GET_LANG_LIST)
const i18n = createI18n({
    legacy: true, // 设置为 false，启用 composition API 模式
    messages,
    locale: navigator.language, // 设置默认语言
});
window.language=messages

const root = createApp(App).use(vuetify).use(createPinia()).use(router).use({
    install: (app, options) => {
        app.config.globalProperties.$store = useStore()
    }
}).use(i18n).mount('#app')



export default root