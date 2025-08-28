/*
 * @Author: 羊驼
 * @Date: 2025-07-22 09:31:27
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-28 09:39:27
 * @Description: file content
 */
/// <reference path="./types/index.d.ts"/>
import pty from "@lydell/node-pty";
import os from "node:os";
import { spawn } from "node:child_process";
import path from "node:path";

export default async function () {
  Console.clear();
  win.setSkipTaskbar(true);
  win.setParentWindow(null);
  win.setAlwaysOnTop(true,"screen-saver");
  // 在屏幕中间且上方
  let { ipcMain, dialog, shell: electron_shell, screen } = electron;
  const simpleMode = () => {
    let { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setResizable(true);
    win.hide();
    win.setSize(300, 40);
    win.setPosition(width - win.getSize()[0], height - win.getSize()[1]);
    win.setMovable(false);
    win.setResizable(false);
    win.show();
  };

  const fullMode = () => {
    let { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setSize(400, 600);
    // 居中
    let x = (width - win.getSize()[0]) / 2;
    let y = (height - win.getSize()[1]) / 2;
    win.setPosition(x, y);
    win.setMovable(true);
    win.show();
  };

  let shell = os.platform() === "win32" ? "powershell.exe" : "bash";
  let ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: __dirname,
  });

  const clearString = (text) => {
    const ansiRegex = /\x1B\[[0-9;]*[a-zA-Z]/g;
    return text
      .replace(ansiRegex, "") // 移除 ANSI 转义序列
      .replace(/\r\n/g, "\n") // 将 Windows 换行符统一为 \n
      .replace(/\n+/g, "") // 合并连续空行
      .trim(); // 去
  };
  let running = false;
  const getCommandData = async (command, string = true, origin = false) => {
    let receiveData = [];
    return new Promise((res) => {
      if (running) {
        let count = 0;
        while (running) {
          count++;
          if (count > 100) {
            break;
          }
        }
      }
      running = true;
      ptyProcess.write(command);
      let compare = clearString(command);
      let originText = "";
      ptyProcess.onData((data) => {
        let text = clearString(data);
        if (text && !text.includes("PS")) {
          receiveData.push(text);
          originText += data;
          if (text.includes(compare)) {
            receiveData = [];
            originText = "";
          }
        }
        if (!text.includes(compare) && text.includes("PS")) {
          let isValid = text.substring(0, text.indexOf("PS"));
          originText += data;
          if (isValid.length) {
            receiveData = receiveData.concat(isValid.split("\n"));
          }
          ptyProcess.clear();
          running = false;
          if (origin) {
            return res(originText);
          }
          if (string) {
            // 合并数组为单个字符串
            const rawString = receiveData.join("");
            return res(clearString(rawString));
          }
          return res(receiveData);
        }
      });
    });
  };

  let events = {
    "set-mode": async (event, mode) => {
      if (mode) {
        simpleMode();
      } else {
        fullMode();
      }
    },
    "check-nvm": async (event) => {
      let data = await getCommandData("nvm --version\r\n", true, true);
      let allVersions = data.match(/\d+\.\d+\.\d+/g);
      if (!allVersions) return false;
      return allVersions[0];
    },
    "install-nvm": async (event) => {
      let child = spawn(path.join(__dirname, "./static/nvm-setup.exe"));
      return new Promise((res) => {
        child.on("exit", (code) => {
          if (code) {
            dialog.showErrorBox("安装失败", "可能是手动退出或者安装异常");
            electron_shell.openPath(path.join(__dirname, "static"));
          } else {
            win.webContents.send("check-nvm");
          }
          res();
        });
      });
    },
    "get-nvm-version": async (event) => {
      let data = await getCommandData("nvm list\r\n", true, true);
      let allVersions = data.match(/\d+\.\d+\.\d+/g);
      let currentVersionMatch = data.match(/\* (\d+\.\d+\.\d+)/);
      allVersions =
        allVersions &&
        allVersions.map((x) => ({
          version: x,
          use: x === currentVersionMatch[1],
        }));
      return allVersions || [];
    },
    "install-version": async (event, version) => {
      let result = await getCommandData(`nvm install ${version}\r\n`);
      return result;
    },
    "use-version": async (event, version) => {
      await getCommandData(`nvm use ${version}\r\n`);
    },
    "delete-version": async (event, version) => {
      await getCommandData(`nvm uninstall ${version}\r\n`);
    },
    "show-error-dialog": async (event, title, message) => {
      return dialog.showErrorBox(title, message);
    },
    "get-setting": async (event) => {
      let proxy = await getCommandData("nvm proxy\r\n");
      if (proxy.includes("none")) {
        proxy = "";
      } else {
        proxy = proxy.substring(proxy.indexOf(":") + 2);
      }
      return {
        proxy,
        node: "",
        npm: "",
      };
    },
    "save-setting": async (event, data) => {
      let { proxy, node, npm } = data;
      if (proxy == "") {
        proxy = "none";
      }
      await getCommandData(`nvm proxy ${proxy}\r\n`);
      await getCommandData(`nvm node_mirror ${node}\r\n`);
      await getCommandData(`nvm npm_mirror ${npm}\r\n`);
    },
    "open-config": async (event) => {
      let root_path = await getCommandData(`nvm root \r\n`);
      let configPath = path.join(root_path.substring(root_path.indexOf(":") + 2), "settings.txt");
      electron_shell.openPath(configPath);
    },
    "nvm-on": async (event) => {
      await getCommandData(`nvm on\r\n`);
    },
    "nvm-off": async (event) => {
      await getCommandData(`nvm off\r\n`);
    },
    close: async (event) => {
      win.close();
    },
  };
  for (let kv in events) {
    ipcMain.removeHandler(kv);
    ipcMain.handle(kv, events[kv]);
  }
  return {
    windowFocus: false,
    focus() {
      win.webContents.send("focus");
    },
    unload() {
      for (let kv in events) {
        ipcMain.removeHandler(kv);
      }
    },
  };
}
