require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')

const indexRouter = require('./routes/index')
const paramsRouter = require('./routes/parameters')
const todoRouter = require('./routes/todo')
const userRouter = require('./routes/user')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// session 必须定义在 router 之前
app.set('trust proxy', 1)
app.use(session({
  name: 'todo-session-id-233',
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}))

// router
app.use('/', indexRouter)
app.use('/params', paramsRouter)
app.use('/todo', todoRouter)
app.use('/user', userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
