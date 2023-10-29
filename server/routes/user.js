var express = require('express')
var router = express.Router()
const { query, validationResult } = require('express-validator')
const { User, UserCreate, UserByName, UserLogin } = require('../model/user')

// 这个是渲染页面的接口
router.get('/login', function(req, res, next) {
    res.render('user/login', {})
})

router.get('/logout', function(req, res, next) {
    req.session.name = null
    res.redirect('/user/login')
})

// 这个是提交登录的接口
router.post('/login', async function(req, res, next) {
    let loginSuccess = true
    let name = 'abc'

    name = req.body.name
    const password = req.body.password
    let user = await UserLogin(name, password)
    if (!user) {
        loginSuccess = false
    } else {
        name = user.name
    }

    if (loginSuccess) {
        req.session.name = name
        res.redirect('/user')
    } else {
        res.render('user/login', {
            err: "登录失败",
        })
    }
})

router.get('/register', function(req, res, next) {
    res.render('user/register', {})
})

router.post('/register', async function(req, res, next) {
    let registerSuccess = true
    
    const name = req.body.name
    const password = req.body.password
    let user = await UserByName(name)
    // console.log(name, password, user)
    if (!user) {
        await UserCreate(name, password)
    } else {
        registerSuccess = false
    }

    if (registerSuccess) {
        res.redirect('/user/login')
    } else {
        res.render('user/register', {
            err: "注册失败",
        })
    }
})

// 这里是用户页面, 如果没登录则重定向为登录页, 如果登录了则展示用户名称
router.get('/', function(req, res, next) {
    if (req.session.name) {
        res.render('user/index', {
            name: req.session.name,
        })
    } else {
        // 重定向到登录页面
        res.redirect('/user/login')
    }
}) 

module.exports = router
