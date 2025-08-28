/*
 * @Author: 羊驼
 * @Date: 2025-07-09 11:42:29
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-19 16:56:46
 * @Description: file content
 */

export default {
  SYSTEM: {
    CLOSE: "system:close",
    FULLSCREEN: "system:fullscreen",
    MINIMIZE: "system:minimize",
    GET_CONFIG: "system:getConfig",
    SET_CONFIG: "system:setConfig",
    GET_OPEN_DIALOG: "system:getOpenDialog",
    GET_FOLDER_FILE_LIST: "system:getFolderFileList",
    GET_FILE_DATA: "system:getFileData",
    GET_MONITOR_INFO: "system:getMonitorInfo",
  },

  FILE: {
    OPEN_FILE: "file:openFile",
    GET_FILE_LIST: "file:getFileList",
    CREATE_FILES: "file:createFiles",
    DELETE_FILES: "file:deleteFiles",
    EDIT_FILES: "file:editFiles",
    OPEN_FILE_WINDOW: "file:openFileWindow",
    OPEN_IDE: "file:openIDE",
  },

  UPDATE: {
    FILE: "window:file:update",
    LOG: "window:log:update",
    SHELL: "window:shell:update",
    CONFIG: "window:config:update",
    BACKGROUND: "window:background:update",
    TOOLS: "window:tools:update",
  },

  FILE_WINDOW: {
    SET_SETTING: "window:file:setSetting",
  },
};
