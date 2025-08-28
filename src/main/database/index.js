/*
 * @Author: 羊驼
 * @Date: 2025-06-17 10:20:25
 * @LastEditors: 羊驼
 * @LastEditTime: 2025-08-20 09:40:33
 * @Description: 数据库类
 */
const { Sequelize } = require('sequelize');
import { app, BrowserWindow, dialog } from 'electron'
import path from 'node:path'
const database = path.join(__dirname, "../../resources/other/database.sqlite").replace("app.asar", "app.asar.unpacked");
//　初始化文件与数据库
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: database,
    logging: false,
});

export default class Database {

    // sequelize对象
    static sequelize = sequelize;
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

    getSequlize() {
        return sequelize
    }
}