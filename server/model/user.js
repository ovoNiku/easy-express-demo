const { Sequelize, Op } = require('sequelize')
const { dbclient, configfunc, RandomSalt, PasswordHash } = require('./base')

const User = dbclient.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.TEXT,
    },
    salt: {
        type: Sequelize.TEXT,
    },
    password: {
        type: Sequelize.TEXT,
    },
}, configfunc('user'))

User.sync()

const UserCreate = async function(name, password) {
    const salt = RandomSalt()
    const hashPassword = await PasswordHash(password, salt)
    return await User.create({
        name: name,
        salt: salt,
        password: hashPassword,
    })
}

const UserByName = async function(name) {
    return await User.findOne({
        where: {
            name: { [Op.eq]: name },
        }
    })
}

const UserLogin = async function(name, password) {
    const user = await UserByName(name)
    if (!user) {
        return null
    }
    const hash = await PasswordHash(password, user.salt)
    return await User.findOne({
        where: {
            name: { [Op.eq]: name },
            password: { [Op.eq]: hash },
        }
    })
}

module.exports = {
    User, UserCreate, UserByName, UserLogin,
}
