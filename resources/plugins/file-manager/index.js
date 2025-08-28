/*
 * @Author: 羊驼
 * @Date: 2025-08-07 11:49:40
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 16:39:15
 * @Description: file content
 */
/// <reference path="./types/index.d.ts"/>
import api from "./common/api.js";
import fs from "node:fs";
import path from "node:path";
import exec from "node:child_process";
let { INTEGER, STRING, TEXT } = electron.database.Sequelize.DataTypes;
let { fn, col } = electron.database.Sequelize;
let { ipcMain, dialog, BrowserWindow, shell } = electron;
const Files = electron.database.createDatabase(
  "sys_files",
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
      comment: "文件名称",
    },
    path: {
      type: TEXT,
      allowNull: false,
      comment: "文件路径",
    },
    type: {
      type: STRING,
      allowNull: false,
      comment: "文件类型",
    },
    icon: {
      type: STRING,
      allowNull: false,
      comment: "文件图标",
    },
    custom_icon: {
      type: TEXT,
      allowNull: true,
      defaultValue: "",
      comment: "自定义图标",
    },
    group: {
      type: STRING,
      allowNull: true,
      comment: "文件类型",
      defaultValue: "未分组",
    },
    order: {
      type: INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "排序",
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
let window = null;
let getWindow = () => {
  if (window) {
    window.isVisible() ? window.hide() : window.show();
    return window;
  } else {
    window = BrowserWindow({
      width: 500,
      height: 300,
      minWidth: 300,
      minHeight: 300,
      fullscreenable: true,
      title: "文件管理器",
      movable: true,
      // skipTaskbar: true,
      resizable: true,
      frame: false,
      titleBarStyle: "hidden",
      hasShadow: false,
      show: true,
    });
    if (isDev) {
      window.loadURL(`http://localhost:5175/#/file`);
      window.webContents.openDevTools();
    } else {
      window.loadFile(path.join(__dirname, "./html/index.html"), { hash: "file" });
    }
    window.show();
    window.on("close", (e) => {
      window = null;
    });
    return window;
  }
};
export default async function () {
  if (!(await electron.database.checkTableExist("sys_files"))) {
    await Files.sync();
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
    // 用IDE打开目录
    [api.FILE.OPEN_IDE]: (event, path) => {
      exec(path);
    },
    // 打开文件
    [api.FILE.OPEN_FILE]: (event, item) => {
      shell.openPath(item.path);
    },
    // 获取文件列表
    [api.FILE.GET_FILE_LIST]: async () => {
      let data = await Files.findAll({
        raw: true,
        order: [
          ["updatedAt", "desc"],
          ["order", "asc"],
        ],
      });
      return CreateResponse(true, "获取文件列表成功", data);
    },
    // 创建文件列表
    [api.FILE.CREATE_FILES]: async (event, files) => {
      let order = await Files.findAll({ attributes: [[fn("max", col("order")), "max"], "group"], group: ["group"], raw: true });
      order = order.reduce((pre, cur) => {
        pre[cur.group] = cur.max;
        return pre;
      }, {});
      files = files.map((x) => {
        if (order[x.group]) {
          x.order = order[x.group]++;
        } else {
          x.order = 0;
        }
        return x;
      });
      return await Files.bulkCreate(files)
        .then((target) => {
          win.webContents.send(api.UPDATE.FILE);
          return CreateResponse(true, "创建成功");
        })
        .catch((err) => {
          Console.log(err);
          return CreateResponse(false, "创建失败");
        });
    },
    // 修改快捷文件
    [api.FILE.EDIT_FILES]: async (event, files) => {
      // Console.log(list);
      return await Files.bulkCreate(files, {
        updateOnDuplicate: ["id", "name", "path", "type", "icon", "custom_icon", "group", "order"],
        // fields: []
      })
        .then((target) => {
          win.webContents.send(api.UPDATE.FILE);

          return CreateResponse(true, "修改成功");
        })
        .catch((err) => {
          Console.log(err);
          return CreateResponse(false, "修改失败");
        });
    },
    // 删除文件列表
    [api.FILE.DELETE_FILES]: async (event, id) => {
      return await Files.destroy({ where: { id } })
        .then(() => {
          win.webContents.send(api.UPDATE.FILE);
          return CreateResponse(true, "删除成功");
        })
        .catch((err) => {
          Console.log(err);
          return CreateResponse(false, "删除失败");
        });
    },
    // 打开快捷文件窗口
    [api.FILE.OPEN_FILE_WINDOW]: (event) => {
       getWindow();
    },
    [api.FILE_WINDOW.SET_SETTING]: (event, pin) => {
      window.setAlwaysOnTop(pin, "screen-saver", 10);
      window.setMovable(!pin);
      window.setResizable(!pin);
    },
  };
  for (let kv in events) {
    ipcMain.removeHandler(kv);
    ipcMain.handle(kv, events[kv]);
  }
  return {
    windowFocus: false,
    focus() {
      let file_window = getWindow();
      file_window.focus();
      file_window.show();
      file_window.center();
    },
    unload() {
      window && !window.isDestroyed() && window.close();
      window = null;
      for (let kv in events) {
        ipcMain.removeHandler(kv);
      }
    },
  };
}
