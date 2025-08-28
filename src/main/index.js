/*
 * @Author: 羊驼
 * @Date: 2025-05-29 16:00:32
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 15:01:28
 * @Description: 主入口
 */
import { app, BrowserWindow, Tray, nativeImage, globalShortcut, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '@resources/pictures/icon.png?asset&asarUnpack'
import EventCenter from "./event"
import Config from './config'
import Application from "./utils/application"
import DataListener from './listener'
import api from '@resources/js/api'
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
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
      // nodeIntegrationInSubFrames: true,
      webviewTag: true,
    },
    frame: false,
    titleBarOverlay: "hidden",
    // center: true
  })

  Application.window = mainWindow

  const tray = new Tray(nativeImage.createFromPath(icon))

  tray.setToolTip("羊驼的工具箱")

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

  // !app.isPackaged && mainWindow.webContents.openDevTools()


  mainWindow.on('ready-to-show', () => {
    Config.registerRecord(mainWindow, Config.WINDOW_ENUM.MAIN)
    Config.setWindowPosition(Config.WINDOW_ENUM.MAIN, true, false)
  })

  // 搜索窗口实现
  const createSearchWindow = () => {
    // 全屏
    let window = new BrowserWindow({
      title: '搜索',
      show: false,
      x: 0,
      y: 0,
      icon: nativeImage.createFromPath(icon),
      autoHideMenuBar: true,
      fullscreen: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
      },
      frame: false,
      titleBarOverlay: "hidden",
      skipTaskbar: true,
      resizable: true,
      alwaysOnTop: true,
      transparent: true,
      movable: false,
    })
    Application.search = window
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(process.env['ELECTRON_RENDERER_URL'] + "/#/search")
    } else {
      window.loadFile(join(__dirname, '../renderer/index.html'), { hash: "search" })
    }
    const setPosition = () => {
      const point = screen.getCursorScreenPoint()
      const activeScreen = screen.getDisplayNearestPoint(point)
      window.setBounds(activeScreen.bounds)
      return activeScreen.bounds
    }

    window.on('ready-to-show', () => {
      Config.registerRecord(window, Config.WINDOW_ENUM.SEARCH)
      // 宽高 根据实际屏幕电脑屏幕 不覆盖任务栏
      setPosition()
    })

    window.on("show", () => {
      let { x, width, height } = setPosition()
      // 设置主窗口位置到搜索栏下面
      mainWindow.setBounds({
        // 居中
        x: x + width * 0.2,
        y: height * 0.1 + 100,
        width: width * 0.6,
        height: height * 0.7
      })
      let config = Config.getConfig()
      config.windows[Config.WINDOW_ENUM.MAIN].bounds = mainWindow.getBounds()
      Config.setConfig(config)
      mainWindow.setAlwaysOnTop(true)
      mainWindow.show()
      window.setAlwaysOnTop(true, "screen-saver")
      window.focus()
      window.webContents.send(api.SEARCH.SHOW)
      window.once("hide", () => {
        mainWindow.setAlwaysOnTop(false)
      })
    })
    !app.isPackaged && window.webContents.openDevTools()

  }

  createSearchWindow()
  // 事件监听
  new EventCenter()
  new DataListener()
})