/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 11:33:31
 * @Description: 主入口
 */
import { app, BrowserWindow, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '@resources/pictures/icon.png?asset&asarUnpack'
import EventCenter from "./event"
import Config from './config'
import Application from "./utils/application"
import DataListener from './listener'
new Application(() => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: '羊驼的工具箱',
    width: 1200,
    height: 600,
    minWidth: 1200,
    minHeight: 600,
    show: false,
    icon: nativeImage.createFromPath(icon),
    resizable: true,
    fullscreenable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    frame: false,
    titleBarOverlay: "hidden",
    // center: true
  })

  Application.window = mainWindow

  const tray = new Tray(nativeImage.createFromPath(icon))

  tray.setToolTip("羊驼的终端管理器")

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })


  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  !app.isPackaged && mainWindow.webContents.openDevTools()


  mainWindow.on('ready-to-show', () => {
    Config.registerRecord(mainWindow, Config.WINDOW_ENUM.MAIN)
    Config.setWindowPosition(Config.WINDOW_ENUM.MAIN, true)
  })

  // 事件监听
  new EventCenter()
  new DataListener()
})