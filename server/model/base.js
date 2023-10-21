const { Sequelize } = require('sequelize')

// 数据库连接应该保持全局用一份
const dbclient = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.db',
})

const configfunc = function(tableName) {
    return {
        // 不要自动添加时间戳
        timestamps: false, 
        // 不要把下划线自动转换成驼峰
        underscored: true,
        // 不要自己改表名(加复数等)
        freezeTableName: true,
        // 使用这个表名
        tableName: tableName,
    }
}

module.exports = {
    dbclient, configfunc,
}