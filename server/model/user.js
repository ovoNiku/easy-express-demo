const { Sequelize, Op } = require('sequelize')
var { dbclient, configfunc, RandomSlat, PasswordHash } = require('./base')

//定义表的模型
const User = dbclient.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.TEXT,
    },
    slat: {
        type: Sequelize.TEXT,
    },
    password: {
        type: Sequelize.TEXT,
    },
}, configfunc('user'))

// 创建表
User.sync()

// 这种框架的隐式 api 显示的写出来比较好
// 不然每个人看这个代码都要学一遍 sequelize
const UserCreate = async function(name, password) {
    const slat = RandomSlat()
    const hashPassword = await PasswordHash(password, slat)    
    return await User.create({
        name: name,
        slat: slat,
        password: hashPassword,
      })
}

const UserByName = async function(name) {
    return await User.findOne({
        where: {
            name: {
              [Op.eq]: name,
            }
          }
    })
}

const UserLogin = async function(name, poassword) {
    const user = await UserByName(name)
    if (!user) {
        return null
    }
    const hash = await PasswordHash(poassword, user.slat)
    return await User.findOne({
        where: {
            name: {
                [Op.eq]: name,
            },
            password: {
                [Op.eq]: hash,
            }
          }
    })
}

module.exports = {
    User, UserCreate, UserByName, UserLogin,
}