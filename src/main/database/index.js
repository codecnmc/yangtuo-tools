/*
 * @Author: 羊驼
 * @Date: 2025-06-17 10:20:25
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-07-15 11:08:42
 * @Description: 数据库类
 */
const { Sequelize } = require('sequelize');
import database from "@resources/other/database.sqlite?asset&asarUnpack"
import { app, BrowserWindow, dialog } from 'electron'
//　初始化文件与数据库
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: database,
    logging: false,
});

import FilesModel from "./models/Files"
import ShellsModel from "./models/Shells"
import LogsModel from "./models/Logs"
let ModelsConfig =
{
    freezeTableName: true, // Model 对应的表名将与model名相同
    timestamps: true,
    paranoid: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
}
// 模型
const Files = sequelize.define("sys_files", FilesModel, ModelsConfig)
const Shell = sequelize.define("sys_shell", ShellsModel, ModelsConfig)
const Logs = sequelize.define("sys_logs", LogsModel, ModelsConfig)


// Files.sync({ alter: true })

export default class Database {

    // sequelize对象
    static sequelize;
    // 单例
    static _instance = null
    static getInstance() {

        if (!this._instance) {
            this._instance = new Database()
        }
        return this._instance
    }

    constructor() {
        this.init()
    }

    /**
     * @description: 初始化
     * @return {*}
     */
    async init() {
        try {
            await sequelize.authenticate();
            console.log('数据库连接成功');
            let exist = await sequelize.getQueryInterface().tableExists("sys_shell")
            console.log(`数据表存在结果:${exist}`);
            !exist && await sequelize.sync()
            // sequelize.sync({ alter: true })
        } catch (error) {
            console.error('无法连接到数据库:', error);
            let window = BrowserWindow.getFocusedWindow()
            if (!window) {
                return app.quit()
            }
            let result = dialog.showMessageBoxSync(window, {
                title: "错误",
                message: "数据库连接失败,即将退出",
                detail: error.message,
                type: "error"
            })
            if (!result) {
                app.quit()
            }
        }
    }

    /**
     * @description: 数据清空
     * @return {*}
     */
    async clearData() {
        await sequelize.truncate({ force: true })
    }

    /**
     * @description: 获取模型
     * @return {*}
     */
    getModels() {
        return { Files, Shell, Logs }
    }
}