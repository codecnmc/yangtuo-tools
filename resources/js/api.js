/*
 * @Author: 羊驼
 * @Date: 2025-07-09 11:42:29
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-16 11:54:21
 * @Description: file content
 */


export default {
    SYSTEM: {
        "CLOSE": "system:close",
        "FULLSCREEN": "system:fullscreen",
        "MINIMIZE": "system:minimize",
        "GET_CONFIG": "system:getConfig",
        "SET_CONFIG": "system:setConfig",
        "GET_OPEN_DIALOG": "system:getOpenDialog",
        "GET_FOLDER_FILE_LIST": "system:getFolderFileList",
        "GET_FILE_DATA": "system:getFileData",
        "GET_MONITOR_INFO": "system:getMonitorInfo",
        "CONFIG_RESTORE": "system:configRestore",
        "CLEAR_DATA": "system:clearData",
        "CHANGE_BACKGROUND": "system:changeBackground",
    },

    SHELL: {
        "GET_SHELL_LIST": "shell:getShellList",
        "CREATE_SHELL": "shell:createShell",
        "EDIT_SHELL": "shell:editShell",
        "DELETE_SHELL": "shell:deleteShell",
        "START_SHELL": "shell:startShell",
        "STOP_SHELL": "shell:stopShell",
        "SET_LOG_SHOW": "shell:setLogShow",
        "OPEN_SHELL_WINDOW": "shell:openShellWindow"
    },

    FILE: {
        "OPEN_FILE": "file:openFile",
        "GET_FILE_LIST": "file:getFileList",
        "CREATE_FILES": "file:createFiles",
        "DELETE_FILES": "file:deleteFiles",
        "EDIT_FILES": "file:editFiles",
        "OPEN_FILE_WINDOW": "file:openFileWindow",
        "OPEN_IDE": "file:openIDE"
    },

    LOG: {
        "GET_LOG_LIST": "log:getLogList",
    },

    UPDATE: {
        "FILE": "window:file:update",
        "LOG": "window:log:update",
        "SHELL": "window:shell:update",
        "CONFIG": "window:config:update",
        "BACKGROUND": "window:background:update"
    },

    FILE_WINDOW: {
        SET_SETTING: "window:file:setSetting",
    },

    TERM_WINDOW: {
        CLOSE: "window:term:close",
        MINIMIZE: "window:term:minimize",
        FULLSCREEN: "window:term:fullscreen",
        SET_SETTING: "window:term:setSetting",

    }

}