const express = require('express')
const router = express.Router()

const Todo = require('../model/todo')
const { RandomSalt } = require('../model/base')

// 统一的 async 错误处理包装
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

router.get('/list/render', function(req, res) {
    res.render('todo', {})
})

// 改为 POST，content 从 body 读取
router.post('/add', asyncHandler(async function(req, res) {
    const content = req.body.content
    if (!content) {
        return res.status(400).send({ success: false, error: 'content is required' })
    }
    const todo = await Todo.create({ content })
    res.send({ success: true, id: todo.id })
}))

router.get('/list', asyncHandler(async function(req, res) {
    const pageSize = 10
    const pageNum = parseInt(req.query.pageNum) || 0
    const offset = pageSize * pageNum

    const [todoList, total] = await Promise.all([
        Todo.findAll({ offset, limit: pageSize }),
        Todo.count(),
    ])

    res.send({
        success: true,
        dataList: todoList,
        pageSize,
        pageNum,
        total,
    })
}))

// 仅在非生产环境可用
if (process.env.NODE_ENV !== 'production') {
    router.get('/test', asyncHandler(async function(req, res) {
        const number = parseInt(req.query.number) || 1
        for (let i = 0; i < number; i++) {
            await Todo.create({ content: RandomSalt() })
        }
        res.send({ success: true })
    }))
}

module.exports = router
