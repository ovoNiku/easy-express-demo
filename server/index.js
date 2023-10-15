const express = require('express')
const app = require('./app')

// 启动
app.listen(3000, () => {
    console.log("http://localhost:3000/")
})