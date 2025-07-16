/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-15 11:02:22
 * @Description: file content
 */
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@resources": resolve("./resources")
      }
    },
    plugins: [externalizeDepsPlugin()],

  },
  preload: {
    resolve: {
      alias: {
        "@resources": resolve("./resources")
      }
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        "@resources": resolve("./resources")
      }
    },
    plugins: [vue(), vuetify({ autoImport: true })]
  }
})
