# nodejs-todo-server

## 准备工作: 初始化项目

    ## 初始化 npm
    npm init

    # 安装 express 依赖
    npm install express --save

    # 安装 express 脚手架工具, 方便生成程序模版
    npm install -g express-generator

    # 回到上一级目录, 创建程序模版, 然后再回到这个目录
    cd ..
    express --view=ejs server
    cd server
    
    # 安装依赖
    npm i

    # 安装热更新插件支持快速开发, 全局安装 nodemon
    # 添加配置文件 nodemon.json, 配置见下文 
    npm install -g nodemon

    # 启动程序, 项目模版提供了启动入口, bin/www, 这里先用 index.js 顶替一下
    nodemon index.js

    # 使用 session
    npm install express-session --save
    # 使用 validator 实现请求参数的数据校验
    # 文档 https://express-validator.github.io/docs/
    # 参考博客 https://blog.csdn.net/weixin_45745641/article/details/127483540
    npm install express-validator --save

### nodemon.json 配置如下

```json
{
    "restartable": "rs",
    "ignore": [
        ".git",
        ".svn",
        "node_modules/**/node_modules",
        "*.md"
    ],
    "verbose": true,
    "execMap": {
        "js": "node --harmony"
    },
    "watch": [],
    "env": {
        "NODE_ENV": "development"
    },
    "ext": "ejs js json"
}
```

### index.js

```
const express = require('express')
const app = require('./app')

// 启动
app.listen(3000, () => {
    console.log("http://localhost:3000/")
})
```

### 数据库相关

    # 安装数据库
    # 文档 https://github.com/TryGhost/node-sqlite3/wiki/API
    npm install sqlite3 --save

    # 使用 orm https://sequelize.org/
    npm install sequelize --save

    # 安装 sqlite 数据库管理软件 https://sqlitebrowser.org/dl/

### 常用sql示例

```sql
-- 创建库表
CREATE TABLE if not exists todo (
	id Integer PRIMARY KEY AUTOINCREMENT,
	content Text default '',
    create_time Date,
    update_time Date 
);

-- 查询
select * from todo;
-- 插入
insert into todo(ID, CONTENT) values(1, 'test1');
-- 更新
update todo set content = '中文测试3' where id = 3;
-- 删除
delete from todo where id in (1, 2);
```