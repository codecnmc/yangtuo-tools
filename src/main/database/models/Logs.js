
const { INTEGER, STRING, TEXT } = require('sequelize');
export default {
    id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: STRING,
        allowNull: false,
        comment: "日志类型",
        // ["随便填"]
    },
    level: {
        type: STRING,
        allowNull: false,
        comment: "日志等级",
        // ["信息","错误"]
    },
    content: {
        type: TEXT,
        allowNull: false,
        comment: "日志内容"
    },
    shell_id: {
        type: INTEGER,
        allowNull: true,
        comment: "启动项ID"
    }
}