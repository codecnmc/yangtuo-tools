/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-06-23 16:19:28
 * @Description: main.js
 */
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { createPinia } from 'pinia'
import router from "./router/index.js"
import useStore from './store/index.js'
const root = createApp(App).use(vuetify).use(createPinia()).use(router).use({
    install: (app, options) => {
        app.config.globalProperties.$store = useStore()
    }
}).mount('#app')

export default root