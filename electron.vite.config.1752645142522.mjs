// electron.vite.config.mjs
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
var electron_vite_config_default = defineConfig({
  main: {
    resolve: {
      alias: {
        "@resources": resolve("./resources")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        "@resources": resolve("./resources")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@resources": resolve("./resources")
      }
    },
    plugins: [vue(), vuetify({ autoImport: true })]
  }
});
export {
  electron_vite_config_default as default
};
