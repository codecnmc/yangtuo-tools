const { INTEGER, STRING, TEXT } = require('sequelize');
export default {
    id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: STRING,
        allowNull: false,
        comment: "文件名称"
    },
    path: {
        type: TEXT,
        allowNull: false,
        comment: "文件路径"
    },
    type: {
        type: STRING,
        allowNull: false,
        comment: "文件类型"
    },
    icon: {
        type: STRING,
        allowNull: false,
        comment: "文件图标"
    },
    custom_icon: {
        type: TEXT,
        allowNull: true,
        defaultValue: "",
        comment: "自定义图标"
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
        comment: "排序"
    }
}