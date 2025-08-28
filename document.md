# 开发文档
## 开发模式

选择开发插件 选择插件目录位置 成功加载后 自动监听底层脚本变动 以及 根据配置去判断是否监听index.html的变动 热更新

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6e07815fe82c4ed0b5f3204ddea1cabb.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/6429d9140bf944be8c5ec01c9c42c4d4.png)
## 开发目录

 1. types 声明文件 用于index.js及依赖脚本的提示【添加插件时不包含】
 2. view 如使用端口开发时 存储vue/react项目【添加插件时不包含】【非必要】
 3. icon.jpg 工具库插件封面
 4. index.html 界面主入口【可根据配置更改】
 5. index.js 底层主脚本
 6. jsconfig js配置
 7. package.json
 8. readme.md 插件介绍
 9. setting.json 配置文件
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/38f63cf89fc145a686e40307021e4216.png)

## 主进程index.js脚本

```javascript
/// <reference path="./types/index.d.ts"/>

export default async function () {
  let { ipcMain, dialog, shell, screen } = electron;
  return {
    // 搜索选择后是否显示主窗口
    windowFocus: false,
    // 搜索选择后的操作
    focus() {
    
    },
    // 卸载插件时执行
    unload() {

    },
  };
}

```

## 默认插件配置setting.json
```json
{
  
  "name": "shell",                     // 插件名称
  "displayName": "脚本",               // 插件显示名称
  "main": "./html/index.html",         // 插件入口html文件
  "script": "./index.js",              // 插件入口脚本文件  
  "cover": "icon.jpg",                 // 插件封面
  "hash": "",                          // 插件网页路由入口调整
  "version": "0.0.1",                  // 插件版本 
  "author": "yangtuo",                 // 插件作者
  "description": "桌面端管理终端插件",    // 插件描述
  "enable": false,                     // 插件是否启用
  "type": "view",                      // 插件类型
  "framework": ["win32-x64"],          // 插件支持的系统框架
  "electron": {                        // 插件窗口配置 preload不可配置
    "width": 1024,
    "height": 768,
    "webPreferences": {
      "sandbox": false,
      "show": true,
      "nodeIntegration": true,
      "webSecurity": false
    },
    "transparent": true,
    "center": true,
    "show": true,
    "autoHideMenuBar": true,
    "frame": false,
    "titleBarOverlay": "hidden",
    "resizable": false,
    "moveable": false
  },
  "injectCss": true,                  // 是否注入默认的css 位置resoures/style/main.css
  "dev": {                            // 开发环境配置    
    "local": false,                   // 是否使用本地html
    "port": 5174,                     // 本地开发端口
    "devTools": true,                 // 是否打开本地开发工具
    "hash": ""                        // 本地开发路由入口调整
  } 
}

```

## 默认preload配置 前端可获取api

```typescript
declare namespace global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>
        send: (channel: string, ...args: any[]) => void
        sendSync: (channel: string, ...args: any[]) => any
        on: (channel: string, func: (...args: any[]) => void) => void
        once: (channel: string, func: (...args: any[]) => void) => void
        remove: (channel: string, func: (...args: any[]) => void) => void
      }
      getPathForFile: (file: File) => string
    }
  }
}
```

## 主机进程脚本api

```typescript

import { BrowserWindow, dialog,ipcMain,screen, shell,Notification,globalShortcut,app } from "electron"
import sequelize from "./sequelize/index"

import { ModelCtor,Model,Attributes,ModelOptions,ModelAttributes } from "./sequelize/model"
export declare global {
  /**
   * @description: 加载需要热更新的脚本
   * @param {string} path 路径 已插件根路径为准
   * @return {T} 根据脚本export 为准
   */
  declare function loadScript<T>(path: string): T

  /**
   * @description: 调试控制台输出
   * @return {*}
   */
  declare const Console = {
    log(...args: any[]): void {},
    error(...args: any[]): void {},
    warn(...args: any[]): void {},
    trace(...args: any[]): void { },
    clear(): void {}
  }

  /**
   * @description: 开放的electron权限
   */  
  declare const electron = {
    app,
    language: {
      addListener: (callback: (lang: string) => void) => void {},
      removeListener: (callback: (lang: string) => void) => void {},
      clearListener: () => void {},
      getLanguage(): string { },
    },
    database: {
    createDatabase<M extends Model, TAttributes = Attributes<M>>(
      modelName: string,
      attributes: ModelAttributes<M, TAttributes>,
      options?: ModelOptions<M>
      ): ModelCtor<M>
      {},
      checkTableExist(name: string): Promise<boolean>
      ,
      Sequelize: sequelize
    },
    dialog,
    screen,
    ipcMain: {
      on: (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) => void {},
      once: (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) => void {},
      off: (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) => void {},
      removeAllListeners: (channel: string) => void {},
      handle: (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) => void {},
      handleOnce: (channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) => void {},
      removeHandler: (channel: string) => void {},
    },
    BrowserWindow(options: BrowserWindowConstructorOptions): BrowserWindow
    ,
    Notification,
    globalShortcut,
    shell,
  }

  declare const isDev: boolean;

  /**
   * @description: 当前窗体
   */  
  declare const win: BrowserWindow;

  /**
   * @description: 当前根路径
   */  
  declare const __dirname: string;

  /**
   * @description: 当前文件名
   */  
  declare const __filename: string;

}

```
## 默认css变量 injectCss为true时

```css
:root {
  --main-background       : #F9FAFB;
  --background-color      : #F9FAFB;
  --title-bg-color        : #20222A;
  --title-font-color      : #fff;
  --font-color            : #000;
  --background-hover-color: #F9FAFB;
  --font-hover-color      : #ffffff;
  --scroll-track          : rgba(209, 209, 209, 0.5);
  --scroll-thumb          : rgba(209, 209, 209, 1);
  --side-bar-background   : #FFFFFF;
  --side-bar-color        : #000;
  --side-bar-active-bg    : transparent;
  --side-bar-acitve-color : #409EFF;
  --top-bar-height        : 32px;
  --tool-card-bg          : rgba(0, 0, 0, 0.3);
}
```

## 插件开发功能
### 控制台输出 默认console不输出
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/b9dbbf4ed2d84a2681a61e76e666a8a7.png)
### 数据库使用

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/f42573a5190b43fdba5a017b69d80dce.png)

```javascript
let { INTEGER, STRING, TEXT, BOOLEAN } = electron.database.Sequelize.DataTypes;
// 模型定义
const Test = electron.database.createDatabase(
  "sys_test",
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: true,
    paranoid: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
  }
);
	// 表创建
  if (!(await electron.database.checkTableExist("sys_test"))) {
    await Test.sync();
    await Test.create({
      name: "测试",
    });
  }
  let data = await Test.findAll();
  Console.log("获取到的数据", data);
```

### 主进程与渲染进程通讯
#### 主进程代码

```javascript
export default async function () {
  let { ipcMain, dialog, shell, screen } = electron;
  let pong = (event, arg) => {
    Console.log("on监听收到渲染进程的消息", arg);
    // 仅前端sendSync供同步消息使用
    event.returnValue = "主进程返回值";
    // 不建议使用 reply 建议使用invoke返回值
    event.reply("pong", "主进程reply返回值");
  };
  let getTestData = async (event, arg) => {
    Console.log("收到渲染进程的getTestData消息", arg);
    let data = await Test.findAll();
    return data;
  };
  ipcMain.on("ping", pong);
  ipcMain.handle("getTestData", getTestData);

  return {
    // 搜索选择后是否显示主窗口
    windowFocus: false,
    // 搜索选择后的操作
    focus() {},
    // 卸载插件时执行
    unload() {
      ipcMain.off("ping", pong);
      ipcMain.removeHandler("getTestData");
    },
  };
}

```
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/5aac4838931a4b94ab4adac230236e1b.png)


#### 渲染进程代码

```javascript
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>模板</title>
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content>
  </head>
  <body>
    <script type="module">
    let electron = window.electron
    // 监听主进程发送的pong消息
    electron.ipcRenderer.on("pong", (event, arg) => {
        console.log("on监听收到主进程的pong消息", arg);
    });
    // 发送ping消息到主进程，并等待同步返回值
    let data = electron.ipcRenderer.sendSync("ping", "index.html发送的消息")
    console.log("send返回值", data)

    electron.ipcRenderer.invoke("getTestData", "index.html发送的invoke消息").then((result) => {
        console.log("invoke返回值", result)
    })
    </script>
  </body>
</html>

```
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1f421df239384a1f99ef7fe69bdb0b99.png)
### 新窗口创建 
#### 创建文件window.html

```html
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>新窗口</title>
        <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
        <meta http-equiv="Content-Security-Policy" content>
        <style>
            .container{
                position:fixed;
                top:0;
                left:0;
                width:100vw;
                height:100vh;
                display:flex;
                justify-content:center;
                align-items:center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>新窗口</h1>
        </div>
    </body>
</html>

```

#### 主进程代码

```javascript
  import path from "node:path";
  let {	BrowserWindow } = electron;
  let window = BrowserWindow({
    width: 300,
    height: 300,
    show: true,
    center: true,
  });
  window.loadFile(path.join(__dirname, "window.html"));
```
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/bd8bb8f708434d55b7fd8faa8493ac5a.png)
#### 注意事项 如果是用vite或webpack 存在路由的项目时 请根据环境变量加载

```javascript
 if (isDev) {
      window.loadURL(`http://localhost:5175/#/file`);
      window.webContents.openDevTools();
    } else {
      window.loadFile(path.join(__dirname, "./html/index.html"), { hash: "file" });
    }
```

## 插件开发注意事项

 - 使用端口开发时 view文件夹变动不监听
 - 如果多窗口是vue编写 请注意hash或者isDev来加载网页
 - 如果使用额外的脚本且会变动的时候 请使用loadScript("脚本位置") 读取位置是从根目录开始的 使用import会导致脚本缓存
 - type为view的时候 配置的electron无效 且win属性不存在
 - type为window时 win属性可用
