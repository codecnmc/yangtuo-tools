/*
 * @Author: 羊驼
 * @Date: 2025-06-18 16:40:17
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-02 09:14:19
 * @Description: file content
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import Main from "@renderer/views/main/index.vue"
import DeskFile from "@renderer/views/file/index.vue"
import DeskTerminal from "@renderer/views/terminal/index.vue"

const routes = [
    { path: '/', component: Main },
    { path: '/file', component: DeskFile },
    { path: '/terminal', component: DeskTerminal },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router