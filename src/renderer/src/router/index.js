/*
 * @Author: 羊驼
 * @Date: 2025-06-18 16:40:17
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-26 15:53:54
 * @Description: file content
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import Main from "@renderer/views/main/index.vue"
import Search from "@renderer/views/search/index.vue"
const routes = [
    { path: '/', component: Main },
    { path: '/search', component: Search },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router