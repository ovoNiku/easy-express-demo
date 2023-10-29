const { Sequelize } = require('sequelize')
const {pbkdf2, randomBytes} = require("crypto")


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

const RandomSlat = function() {
    return randomBytes(16).toString('hex')
}

const PasswordHash = async function(password, salt) {
    // 迭代次数  越多越慢
    const iterations = 50000
    // 生成的密钥字节数
    const keylen = 64
    const digest = "sha512"
    // pbkdf2是个异步函数，并且哈希值在callback中返回的
    return new Promise((resolve, reject) => {
        pbkdf2(password, salt, iterations, keylen, digest,
            (err, derivedKey) => {
                if (err) {
                    reject(err)
                } else {
                    // 返回最终哈希值
                    const hash = derivedKey.toString('hex')
                    resolve(hash)
                }
            })
        })
}

module.exports = {
    dbclient, configfunc,
    RandomSlat, PasswordHash,
}