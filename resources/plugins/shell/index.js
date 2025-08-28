/*
 * @Author: 羊驼
 * @Date: 2025-08-07 11:49:40
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 16:40:24
 * @Description: file content
 */
/// <reference path="./types/index.d.ts"/>
import api from "./common/api.js";
import fs from "node:fs";
import path from "node:path";
let { INTEGER, STRING, TEXT, BOOLEAN } = electron.database.Sequelize.DataTypes;
let { fn, col } = electron.database.Sequelize;
const Shell = electron.database.createDatabase(
  "sys_shell",
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
      comment: "启动项名称",
    },
    path: {
      type: TEXT,
      allowNull: false,
      comment: "启动项路径",
    },
    order: {
      type: INTEGER,
      allowNull: false,
      comment: "启动顺序",
    },
    enable: {
      type: BOOLEAN,
      allowNull: false,
      comment: "是否启用",
      defaultValue: true,
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
let { ipcMain, dialog, BrowserWindow } = electron;
let terminalWindow = null;
let getWindow = () => {
  if (terminalWindow) {
    terminalWindow.isVisible() ? terminalWindow.hide() : terminalWindow.show();
    return terminalWindow;
  } else {
    let window = BrowserWindow({
      width: 1024,
      height: 600,
      minWidth: 600,
      minHeight: 600,
      fullscreenable: true,
      title: "脚本控制台",
      movable: true,
      // skipTaskbar: true,
      resizable: true,
      frame: false,
      titleBarStyle: "hidden",
      hasShadow: false,
      show: true,
    });
    if (isDev) {
      window.loadURL(`http://localhost:5174/#/terminal`);
    } else {
      window.loadFile(path.join(__dirname, "./html/index.html"), { hash: "terminal" });
    }
    terminalWindow = window;
    window.show();
    window.on("close", (event) => {
      window = null;
    });
    return window;
  }
};

export default async function () {
  // Console.log("插件运行中");
  let ShellManager = await loadScript("./utils/shells.js");
  let shellManager = new ShellManager(Shell, () => {
    return terminalWindow;
  });
  if (!(await electron.database.checkTableExist("sys_shell"))) {
    await Shell.sync();
  }
  const CreateResponse = (status, message, data) => {
    return {
      status,
      message,
      data,
    };
  };
  let events = {
    // 打开文件选择弹窗
    [api.SYSTEM.GET_OPEN_DIALOG]: (event, config) => {
      return dialog.showOpenDialog(null, config);
    },
    // 获取文件夹情况
    [api.SYSTEM.GET_FOLDER_FILE_LIST]: (event, path) => {
      return fs.readdirSync(path);
    },
    [api.SYSTEM.GET_FILE_DATA]: (event, path, type) => {
      let fileBuffer = fs.readFileSync(path);
      return fileBuffer.toString(type);
    },
    // 获取启动项列表
    [api.SHELL.GET_SHELL_LIST]: async () => {
      let data = await Shell.findAll({ order: [["order", "asc"]], raw: true });
      return CreateResponse(true, "获取列表成功", shellManager.GetTask(data));
    },
    // 创建启动项
    [api.SHELL.CREATE_SHELL]: async (event, list, setting) => {
      let order = await Shell.findOne({ attributes: [[fn("max", col("order")), "max"]], raw: true });
      order = (order && order.max) || 1;
      list = list.map((x) => {
        return {
          ...x,
          order: order++,
        };
      });
      return await Shell.bulkCreate(list)
        .then((target) => {
          win.webContents.send(api.UPDATE.SHELL);
          shellManager.StartShells(JSON.parse(JSON.stringify(target)), setting);
          return CreateResponse(true, "创建成功");
        })
        .catch((err) => {
          console.log(err);
          return CreateResponse(false, "创建失败");
        });
    },
    // 修改启动项
    [api.SHELL.EDIT_SHELL]: async (event, list, setting) => {
      // console.log(list);
      return await Shell.bulkCreate(list, {
        updateOnDuplicate: ["id", "name", "path", "order", "enable"],
        // fields: []
      })
        .then((target) => {
          // console.log(target);
          win.webContents.send(api.UPDATE.SHELL);
          shellManager.StartShells(JSON.parse(JSON.stringify(target)), setting);
          return CreateResponse(true, "修改成功");
        })
        .catch((err) => {
          console.log(err);
          return CreateResponse(false, "修改失败");
        });
    },
    // 删除启动项
    [api.SHELL.DELETE_SHELL]: async (event, id) => {
      return await Shell.destroy({ where: { id } })
        .then(() => {
          win.webContents.send(api.UPDATE.SHELL);
          return CreateResponse(true, "删除成功");
        })
        .catch((err) => {
          console.log(err);
          shellManager.InitShells();
          return CreateResponse(false, "删除失败");
        });
    },
    // 启动终端
    [api.SHELL.START_SHELL]: async (event, id) => {
      return shellManager.Start(id);
    },
    // 关闭终端
    [api.SHELL.STOP_SHELL]: async (event, id) => {
      return shellManager.Stop(id);
    },
    // 打开脚本控制台
    [api.SHELL.OPEN_SHELL_WINDOW]: (event) => {
      getWindow();
    },
    // 窗口隐藏
    [api.TERM_WINDOW.CLOSE]: (event) => {
      terminalWindow.hide();
    },
    // 窗口最小化
    [api.TERM_WINDOW.MINIMIZE]: (event) => {
      terminalWindow.minimize();
    },
    // 窗口全屏
    [api.TERM_WINDOW.FULLSCREEN]: (event) => {
      terminalWindow.setFullScreen(!terminalWindow.isFullScreen());
    },
    // 窗口固定设置
    [api.TERM_WINDOW.SET_SETTING]: (event, pin) => {
      terminalWindow.setAlwaysOnTop(pin, "screen-saver", 10);
      terminalWindow.setMovable(!pin);
      terminalWindow.setResizable(!pin);
    },
    // 设置配置
    [api.SYSTEM.SET_CONFIG]: (event, config) => {
      fs.writeFileSync(__dirname + "/config.json", JSON.stringify(config));
      return CreateResponse(true, "设置成功");
    },
    // 获取配置
    [api.SYSTEM.GET_CONFIG]: (event) => {
      return shellManager.getConfig();
    },
  };
  for (let kv in events) {
    ipcMain.removeHandler(kv);
    ipcMain.handle(kv, events[kv]);
  }
  return {
    windowFocus: false,
    focus() {
      let window = getWindow();
      window.focus();
      window.show();
      window.center();
    },
    unload() {
      terminalWindow && !terminalWindow.isDestroyed() && terminalWindow.close();
      terminalWindow = null;
      for (let kv in events) {
        ipcMain.removeHandler(kv);
      }
    },
  };
}
