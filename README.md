## 介绍

[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/thinkkoa/thinkorm.svg?branch=master)](https://travis-ci.org/thinkkoa/thinkorm)
[![Dependency Status](https://david-dm.org/thinkkoa/thinkorm.svg)](https://david-dm.org/thinkkoa/thinkorm)

A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

ThinkORM是一个可扩展轻量级的功能丰富的对象-关系映射的数据模型封装框架，使用Node.js实现。

如同SQL语言发明一样，ThinkORM试图用一种抽象的统一操作语言，尽量保持各种数据库书写语法一致，用户专注于数据操作逻辑而非具体的数据存储类型，达到快速开发和移植的目的。

```js
let info = await model.where({id: {'<>': 1, '>=': 0}, name: 'bb', or: [{name: 'aa'}, {name: 'cc'}]}).find();
```

项目地址： [Git Repo](https://github.com/thinkkoa/thinkorm)

## 特性

1. 基于Knex.js实现,支持 Mysql/MariaDB, PostgresSql, SQLite3, Oracle, MSSQL. (即将支持MongoDB)

2. 抽象的面向对象式SQL操作语言,保持各种数据库书写语法一致,方便开发和项目迁移

3. 支持schema定义数据结构,支持严格的类型检查;支持数据结构迁移到数据库,通过migrate方法调用

4. 支持hasone,hasmany,manytomany关联查询

5. 支持left,right,inner join查询,支持count,sum,group查询

6. 支持连接池配置.支持数据链接检测以及自动重联，数据库服务的宕机修复后无需重启应用

7. 支持事务操作,包括同模型、跨模型、并行事务(Mysql/MariaDB, PostgresSql)

8. 支持数据自动验证以及自定义规则验证,且规则可扩展

9. 支持前置、后置逻辑处理

## 安装

```bash
npm install thinkorm --save
```

## 使用

```js
//class User.js
const {model, helper} = require('thinkorm');

const User = class extends model {
    // 构造方法
    init(){
        // 模型名称,映射实体表 user
        this.modelName = 'user';
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                pk: true
            },
            name: {
                type: 'string',
                size: 30,
                index: true,
                defaults: ''
            }
        };
    }
}

//CURD
const userModel = new User(config);
// add
let result = await userModel.add({"name": "张三"});

// delete
result = await userModel.where({id: 1}).delete();

// update
result = await userModel.where({id: 2}).update({"name": "李四"});

// select 
result = await userModel.where({id: 3}).find(); //limit 1
result = await userModel.where({"name": {"<>": ""}}).select(); //query name is not null


userModel.where({id:1}).find(); //查询一条ID为1的数据
// and
userModel.where({ name: 'walter', state: 'new mexico' }).find();

userModel.where({ age: { '>=': 30 , '<=': 60}}).find();

// or
// select * from think_user where (name = 'walter') or (occupation = 'teacher')
userModel.where({
    or : [
        { name: 'walter' },
        { occupation: 'teacher' }
    ]
}).find();

//select * from think_user where (id = 1 and name = walter) or (occupation ='teacher')
userModel.where({
    or : [
        { name: 'walter' , id: 1},
        { occupation: 'teacher' }
    ]
}).find();

// in
userModel.where({
    name : ['Walter', 'Skyler']
}).find();
// not in
userModel.where({
    name: { 'notin' : ['Walter', 'Skyler'] }
}).find();

userModel.where({
    notin: { 'name' : ['Walter', 'Skyler'] , 'id': [1, 3]}
}).find();

// less than
userModel.where({ age: { '<': 30 }}).find();

// less than or equal
userModel.where({ age: { '<=': 30 }}).find();

// greater than
userModel.where({ age: { '>': 30 }}).find();

// greater than or equal
userModel.where({ age: { '>=': 30 }}).find();

// not equal
userModel.where({ age: { '<>': 30 }}).find();

// not
userModel.where({ age: { 'not': 30 }}).find();

userModel.where({ not: { 'age': 30, 'name': 'aa' }}).find();

//like
userModel.where({ name: { 'like': '%walter' }}).find();
userModel.where({ name: { 'like': 'walter%' }}).find();
userModel.where({ name: { 'like': '%walter%' }}).find();

/*高级查询
字段名为key合并表达式/*
userModel.where({name: {'<>': '', not: 'aa', in: ['111', '222'], notin: ['aa', 'rrr'], like: '%a'}}).find()

//OR 组合及嵌套
userModel.where({
    or : [
        { name: 'walter' , id: 1},
        { occupation: 'teacher' }
    ]
}).find();

userModel.where({
    or : [
        { name: 'walter' , id: 1},
        { occupation: 'teacher' },
        { or: [
                {...},
                {...}
            ]
        }
    ]
}).find();


// join查询
//将join表字段写到field方法内，join表条件写入where
userModel
.field(['id','name','Demo.id','Demo.name'])
.join([{from: 'Demo', on: {demoid: 'id'}, type: 'inner'}])
.where({id: 1, 'Demo.name': 'test'})
.find()

//将join表字段声明在join方法的field属性内
userModel
.join([{from: 'Demo', alias: 'demo', on: {demoid: 'id'}, field: ['id', 'name'], type: 'inner'}])
.where({id: 1, 'demo.name': 'test'})
.find()
join方法传入的是一个数组，每一个数组元素均表示join一个表。

from : 需要的join的模型名

alias : 需要的join的模型查询别名

on : join的on条件

field : join表筛选的字段

type : join的类型，目前支持 inner,left,right三种

// group查询
group查询支持传入单个或多个字段名，多个字段名以数组的形式作为实参

userModel.group('username').find()

userModel.group(['username', 'age']).find()

```

## 文档

[https://www.thinkkoa.org/orm/](https://www.thinkkoa.org/orm/index.jhtml)

## 贡献者

* richenlin
* richerdlee

## 协议


MIT
