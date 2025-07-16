const { INTEGER, STRING, TEXT, BOOLEAN } = require('sequelize');
export default {
    id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: STRING,
        allowNull: false,
        comment: "启动项名称",
    },
    path: {
        type: TEXT,
        allowNull: false,
        comment: "启动项路径"
    },
    order: {
        type: INTEGER,
        allowNull: false,
        comment: "启动顺序"
    },
    enable: {
        type: BOOLEAN,
        allowNull: false,
        comment: "是否启用",
        defaultValue: true
    }
}