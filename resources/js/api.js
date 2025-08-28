/*
 * @Author: 羊驼
 * @Date: 2025-07-09 11:42:29
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-27 10:21:44
 * @Description: file content
 */
export default {

    SYSTEM: {
        "CLOSE": "system:close",
        "FULLSCREEN": "system:fullscreen",
        "MINIMIZE": "system:minimize",
        "GET_CONFIG": "system:getConfig",
        "SET_CONFIG": "system:setConfig",
        "CONFIG_RESTORE": "system:configRestore",
        "CLEAR_DATA": "system:clearData",
        "WEBVIEW": "system:webview",
        "GET_OPEN_DIALOG": "system:getOpenDialog",
        "GET_LANG_LIST": "system:getLangList",
        "GET_VERSION": "system:getVersion",
    },

    UPDATE: {
        "CONFIG": "window:config:update",
        "TOOLS": "window:tools:update",
    },

    TOOLS: {
        "GET_TOOLS_LIST": "tools:getToolsList",
        "SETTING_TOOLS": "tools:settingTools",
        "TOOLS_DEV_START": "tools:devStart",
        "TOOLS_DEV_END": "tools:devEnd",
        "TOOLS_DEV_STATUS": "tools:devStatus",
        "TOOLS_DEV_CONSOLE": "tools:devConsole",
        "TOOLS_GET_CSS": "tools:getCss",
        "TOOLS_ADD": "tools:add",
        "TOOLS_DELETE": "tools:delete"
    },

    SEARCH: {
        "SHOW": "search:show",
        "HIDE": "search:hide",
        "SELECT": "search:select",
        "FOCUS_VIEW": "search:focusView"

    }


}