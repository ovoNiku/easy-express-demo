# 数据库ORM的使用

默认已经安装好了 sqlite 和 sequelize

https://sequelize.org/

主要是两部分工作, 创建数据库表, 支持增删改查

数据库创建方面, 虽然有 sequelize-cli 这样的工具, 但有学习成本, 不考虑使用

## sequelize 的使用方法

```JavaScript
const { Sequelize, DataTypes } = require("sequelize")
const sequelize = new Sequelize("database.db")

const Todo = sequelize.define("todo", {
    id: DataTypes.INTEGER, 
    content: DataTypes.TEXT,
}, {
    // sequelize 默认有很多私货, 这里我们指定不使用这些功能
    // https://stackoverflow.com/questions/21114499/how-to-make-sequelize-use-singular-table-names

    // 不要自动添加时间戳
    timestamps: false, 
    // 不要把下划线自动转换成驼峰
    underscored: true,
    // 不要自己改表名(加复数等)
    freezeTableName: true,
    // 使用这个表名
    tableName: 'todo',
})

(async () => {
    // 这一步会帮助你创建库表
    // 如果填写 force 重新启动时会自动删除已有的库表
    await sequelize.sync({ force: true });
})()

```


## 直接使用 sqlite 的方法

https://expressjs.com/en/guide/database-integration.html#sqlite

虽然我们这里没有使用直连数据库的方法

但是作为一个教程, 这里提供一个例子并不是坏事

```JavaScript
const db = new sqlite3.Database(database)
db.serialize(() => {
    const sqlTodo = `
        CREATE TABLE IF NOT EXISTS todo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            crateTime date,
            updateTime date
        );
    `
    db.run(sqlTodo)
})
db.close()
```