const { Sequelize } = require('sequelize')
const { pbkdf2, randomBytes } = require('crypto')

// 数据库连接保持全局一份
const dbclient = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.db',
})

const configfunc = function(tableName) {
    return {
        timestamps: false,
        underscored: true,
        freezeTableName: true,
        tableName: tableName,
    }
}

const RandomSalt = function() {
    return randomBytes(16).toString('hex')
}

const PasswordHash = async function(password, salt) {
    const iterations = 50000
    const keylen = 64
    const digest = 'sha512'
    return new Promise((resolve, reject) => {
        pbkdf2(password, salt, iterations, keylen, digest,
            (err, derivedKey) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(derivedKey.toString('hex'))
                }
            })
    })
}

module.exports = {
    dbclient, configfunc,
    RandomSalt, PasswordHash,
}
