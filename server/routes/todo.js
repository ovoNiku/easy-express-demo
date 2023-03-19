var express = require('express')
var router = express.Router()
const { query, validationResult } = require('express-validator')

const Todo = require("../model/todo")
const { RandomSalt } = require('../model/base')

router.get('/list/render', function (req, res, next) {
    res.render('todo', {})
})

router.get('/add', function(req, res, next) {
    const s = req.query.content
    Promise.resolve(
        Todo.create({
            content: s,
        })
    ).then()
    res.send('add todo: ' + s)
})

router.get('/list', async function (req, res, next) {
    // 每页固定10条
    const pageSize = 10
    let pageNum = req.query.pageNum || 0
    pageNum = parseInt(pageNum)
    console.log(pageSize, pageNum)
    let offset = pageSize * pageNum
    const todoList = await Todo.findAll({ offset: offset, limit: pageSize })
    const total = await Todo.count()

    res.send({
        success: true,
        dataList: todoList,
        pageSize: pageSize,
        pageNum: pageNum,
        total: total,
    })
})

router.get('/test', async function(req, res, next) {
    // 用于随机生成 N 条测试数据
    const number = req.query.number
    for (let i = 0; i < number; i++) {
        await Todo.create({
            content: RandomSalt(),
        })
    }

    res.send({
        success: true,
    })
})

module.exports = router