var express = require('express')
var router = express.Router()

// pramas page
router.get('/querystring', function(req, res, next) {
    // http://localhost:3000/params/querystring?name=jack
    const name = req.query.name
    console.log(req.query)
    res.send(`Hello, ${name}!`)
})

router.get('/render', function(req, res, next) {
    res.render('render', {});
})

router.post('/form', function(req, res, next) {
    console.log(req.body)
    const name = req.body.name
    res.send(`Hello, ${name}!`)
})

router.post('/body', function(req, res, next) {
    console.log(req.body)
    res.send({
        id: req.body.id,
        success: true,
    })
})

router.get('/user/:id', function (req, res) {
    res.send('user ' + req.params.id)
})

module.exports = router
