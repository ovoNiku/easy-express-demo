var express = require('express')
var router = express.Router()
const { query, validationResult } = require('express-validator')

const Todo = require("../model/todo")

router.get('/add', function(req, res, next) {
    const s = req.query.content
    // 
    Promise.resolve(
        Todo.create({
            content: s,
        })
    ).then()
    res.send('add todo: ' + s)
  })

module.exports = router