# Backend Upgrade & Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 升级 Express Todo 应用的依赖版本，修复代码质量问题，规范 API 设计，提升安全性。

**Architecture:** 保持原有 Express + SQLite + EJS 架构不变，在现有文件基础上做改动，不新增模块层级。所有异步路由通过统一的 `asyncHandler` 包装函数处理错误，session secret 改为从环境变量读取。

**Tech Stack:** Node.js, Express 4.21, EJS 3.1, Sequelize 6, SQLite3, dotenv

---

### Task 1: 升级依赖，删除无用包，添加 dotenv

**Files:**
- Modify: `server/package.json`

**Step 1: 更新 package.json**

将 `server/package.json` 改为：

```json
{
  "name": "server",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  },
  "dependencies": {
    "cookie-parser": "~1.4.6",
    "debug": "~4.3.7",
    "dotenv": "^16.4.5",
    "ejs": "~3.1.10",
    "express": "~4.21.2",
    "express-session": "^1.18.1",
    "express-validator": "^7.0.1",
    "http-errors": "~2.0.0",
    "morgan": "~1.10.0",
    "sequelize": "^6.37.5",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

注意：
- 删除了 `crypto-js`（从未使用，代码用的是 Node 内置 `crypto`）
- `nodemon` 从 `nodemon.json` 配置但未出现在 dependencies，移到 `devDependencies`
- 新增 `dotenv` 用于读取环境变量

**Step 2: 安装依赖**

```bash
cd server
npm install
```

Expected: 安装成功，无报错

**Step 3: 验证服务可以启动**

```bash
npm start
```

Expected: 服务正常启动，`http://localhost:3000` 可访问

**Step 4: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "chore: upgrade dependencies, remove crypto-js, add dotenv"
```

---

### Task 2: 添加 .env 环境变量支持

**Files:**
- Create: `server/.env`
- Create: `server/.env.example`
- Modify: `server/app.js`
- Modify: `.gitignore`（项目根目录，若不存在则创建）

**Step 1: 创建 .env 文件**

创建 `server/.env`：
```
SESSION_SECRET=your-local-secret-change-this
NODE_ENV=development
```

**Step 2: 创建 .env.example**

创建 `server/.env.example`：
```
SESSION_SECRET=your-secret-here
NODE_ENV=development
```

**Step 3: 确保 .env 在 .gitignore 中**

检查项目根目录是否有 `.gitignore`，若没有则创建，确保包含：
```
server/.env
*.db
node_modules/
```

**Step 4: 修改 app.js 加载 dotenv 并使用环境变量**

在 `server/app.js` 顶部第一行加入：
```js
require('dotenv').config()
```

将 session 配置中的 secret 改为：
```js
secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
```

**Step 5: 验证服务可以启动**

```bash
npm start
```

Expected: 服务正常启动

**Step 6: Commit**

```bash
git add server/app.js server/.env.example
git add .gitignore  # 如果修改了
git commit -m "feat: load session secret from environment variable"
```

---

### Task 3: app.js 代码风格统一（var → const）

**Files:**
- Modify: `server/app.js`

**Step 1: 将所有 var 改为 const**

`server/app.js` 完整改动后：

```js
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
```

**Step 2: 验证服务可以启动**

```bash
npm start
```

Expected: 服务正常启动

**Step 3: Commit**

```bash
git add server/app.js
git commit -m "refactor: var -> const in app.js, move session import to top"
```

---

### Task 4: 修复 model/base.js 和 model/user.js（var → const，slat → salt）

**Files:**
- Modify: `server/model/base.js`
- Modify: `server/model/user.js`

**Step 1: 修改 base.js**

```js
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
```

注意：`RandomSlat` 重命名为 `RandomSalt`

**Step 2: 修改 model/user.js（slat → salt）**

```js
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
```

注意：同时修正了参数拼写错误 `poassword` → `password`

**Step 3: 删除旧数据库文件（因为字段名变了）**

```bash
cd server
rm -f database.db
```

**Step 4: 验证服务可以启动，注册和登录功能正常**

```bash
npm start
```

访问 `http://localhost:3000/user/register`，注册一个账号，然后登录，确认正常。

**Step 5: Commit**

```bash
git add server/model/base.js server/model/user.js
git commit -m "fix: rename slat->salt, fix poassword typo, rename RandomSlat->RandomSalt"
```

---

### Task 5: 修复 routes/todo.js（asyncHandler、POST、清理无用 import）

**Files:**
- Modify: `server/routes/todo.js`

**Step 1: 完整替换 routes/todo.js**

```js
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
```

改动说明：
- 删除未使用的 `query, validationResult` import
- `/todo/add` 改为 POST，修复 `await` bug
- `/list` 用 `Promise.all` 并行查询，提升性能
- 用 `asyncHandler` 统一错误处理
- `/test` 加环境判断保护

**Step 2: 验证 /todo/list 正常返回**

```bash
curl http://localhost:3000/todo/list
```

Expected: `{"success":true,"dataList":[],"pageSize":10,"pageNum":0,"total":0}`

**Step 3: 验证 POST /todo/add 正常**

```bash
curl -X POST http://localhost:3000/todo/add \
  -H "Content-Type: application/json" \
  -d '{"content":"test todo"}'
```

Expected: `{"success":true,"id":1}`

**Step 4: Commit**

```bash
git add server/routes/todo.js
git commit -m "fix: todo routes - POST add, asyncHandler, parallel count query, guard test route"
```

---

### Task 6: 修复其余 routes 文件（var → const）

**Files:**
- Modify: `server/routes/index.js`
- Modify: `server/routes/parameters.js`
- Modify: `server/routes/user.js`

**Step 1: 修改 routes/index.js**

```js
const express = require('express')
const router = express.Router()

router.get('/', function(req, res) {
    if (req.session.views) {
        req.session.views++
    } else {
        req.session.views = 1
    }
    res.render('index', {
        title: 'Express',
        count: req.session.views,
    })
})

module.exports = router
```

**Step 2: 修改 routes/parameters.js**

```js
const express = require('express')
const router = express.Router()

router.get('/querystring', function(req, res) {
    const name = req.query.name
    res.send(`Hello, ${name}!`)
})

router.get('/render', function(req, res) {
    res.render('render', {})
})

router.post('/form', function(req, res) {
    const name = req.body.name
    res.send(`Hello, ${name}!`)
})

router.post('/body', function(req, res) {
    res.send({
        id: req.body.id,
        success: true,
    })
})

router.get('/user/:id', function(req, res) {
    res.send('user ' + req.params.id)
})

module.exports = router
```

**Step 3: 修改 routes/user.js（添加 asyncHandler）**

```js
const express = require('express')
const router = express.Router()
const { UserCreate, UserByName, UserLogin } = require('../model/user')

const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

router.get('/login', function(req, res) {
    res.render('user/login', {})
})

router.get('/logout', function(req, res) {
    req.session.name = null
    res.redirect('/user/login')
})

router.post('/login', asyncHandler(async function(req, res) {
    const name = req.body.name
    const password = req.body.password
    const user = await UserLogin(name, password)

    if (user) {
        req.session.name = user.name
        res.redirect('/user')
    } else {
        res.render('user/login', { err: '登录失败' })
    }
}))

router.get('/register', function(req, res) {
    res.render('user/register', {})
})

router.post('/register', asyncHandler(async function(req, res) {
    const name = req.body.name
    const password = req.body.password
    const existing = await UserByName(name)

    if (!existing) {
        await UserCreate(name, password)
        res.redirect('/user/login')
    } else {
        res.render('user/register', { err: '注册失败' })
    }
}))

router.get('/', function(req, res) {
    if (req.session.name) {
        res.render('user/index', { name: req.session.name })
    } else {
        res.redirect('/user/login')
    }
})

module.exports = router
```

**Step 4: 验证注册登录流程正常**

访问 `http://localhost:3000/user/register` 注册，再访问 `http://localhost:3000/user/login` 登录。

Expected: 登录成功后跳转到 `/user` 页面显示用户名

**Step 5: Commit**

```bash
git add server/routes/index.js server/routes/parameters.js server/routes/user.js
git commit -m "refactor: var -> const, add asyncHandler to user routes, clean up"
```

---

### Task 7: 修复 model/todo.js（var → const）

**Files:**
- Modify: `server/model/todo.js`

**Step 1: 修改 model/todo.js**

```js
const { Sequelize } = require('sequelize')
const { dbclient, configfunc } = require('./base')

const Todo = dbclient.define('todo', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: Sequelize.TEXT,
    },
}, configfunc('todo'))

Todo.sync()

module.exports = Todo
```

**Step 2: 验证服务正常启动**

```bash
npm start
```

Expected: 服务正常启动，无报错

**Step 3: Commit**

```bash
git add server/model/todo.js
git commit -m "refactor: var -> const in todo model"
```

---

## 完成检查清单

- [ ] 依赖版本全部升级，`crypto-js` 已删除
- [ ] `dotenv` 已配置，`SESSION_SECRET` 从 `.env` 读取
- [ ] 所有文件 `var` 已替换为 `const/let`
- [ ] `slat` → `salt` 已修正，旧数据库已删除
- [ ] `RandomSlat` → `RandomSalt` 已修正
- [ ] `/todo/add` 已改为 POST
- [ ] 所有 async 路由已加 `asyncHandler`
- [ ] `/todo/list` 使用 `Promise.all` 并行查询
- [ ] `/todo/test` 已加生产环境保护
- [ ] 未使用的 import 已清除
