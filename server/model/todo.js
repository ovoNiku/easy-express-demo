const { Sequelize } = require('sequelize')
var { dbclient, configfunc } = require('./base')

//定义表的模型
const Todo = dbclient.define('todo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: Sequelize.TEXT,
    }
}, configfunc('todo'))

// 创建表
Todo.sync()

module.exports = Todo