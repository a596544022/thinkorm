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
字段名为key合并表达式*/
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

## 数据验证

```

为保证数据入库的准确性，避免例如undefined、null等类型错误，保持多种数据源的数据一致性，例如mongodb就是强类型。ThinkORM默认会强制进行数据类型检查，还可以支持自定义数据检查规则，并可扩展规则。

强制数据类型检查
模型类字段通过type属性来定义数据类型。如果未定义该属性，默认值为string。

// 数据表字段信息
this.fields = {
    id: {
        type: 'integer',
        pk: true
    },
    name: {
        type: 'string',
        index: true,
        defaults: ''
    },
    profile: {
        type: 'integer',
        index: true,
        defaults: 0
    }
};
支持的数据类型有：

属性值	描述
string	字符型
text	文本型
integer	整型
float	浮点型
json	json格式
array	数组格式
如果定义的数据类型未包含在上述值内，默认为string。

新增数据

新增数据时，会根据模型类字段定义的数据类型检查除主键外的其他所有字段数据。

UserModel.add({name: 'aa'});//会自动检查name、profile的值是否符合类型。
更新数据

更新数据时，会根据模型类字段定义的数据类型检查需要更新的字段数据。

UserModel.where({id:1}).update({profile: 1});//仅自动检查profile的值
defaults属性的影响

如果字段设置了defaults属性，且该属性的值不为 undefined 和 null。那么在新增时，如果字段不存在(主键除外)，会自动匹配默认值。在更新时，如果字段的值为空（'',0,null,undefined,仅含空格、换行等占位符的字符串）,也会自动赋值默认值。

//新增时
UserModel.add({name: 'aa'});
//insert into `think_user` (`name`, `profile`) values ('aa', 0);

//更新时
UserModel.where({id: 1}).update({profile: null});
//update `think_user` as `User` set `profile` = 0 where `User`.`id` = 1;

自定义验证
ThinkORM支持自定义的数据验证，例如姓名检查，密码长度检查，手机号码检查等等，通过模型类的validations属性进行配置：

this.validations = {
    username: {
        method: 'ALL',//新增和更新时都验证,method属性不存在则规则无效
        valid: ['required'], //验证规则
        msg: {
            required: '姓名必填'//验证未通过时的错误提示
        }
    },
    type: {
        method: 'ADD', //仅在新增时验证
        valid: ['required'],
        msg: {
            required: '活动类别必填'
        }
    },
    phonenum: {
        method: 'UPDATE',//仅在更新时验证
        valid: ['required','mobile'],
        msg: {
        required: '手机号必填',
        mobile: '请输入正确的手机号'
        }
    }
}

默认的验证规则

ThinkORM自身包含了一个验证库，涵盖了常用的一些数据验证规则:

    length(value, min, max)//长度范围验证
    required(value)//必填
    regexp(value, reg)//自定义正则
    email(value)//email
    time(value)//时间戳
    cnname(value)//中文名
    idnumber(value)//身份证号码
    mobile(value)//手机号码
    zipcode(value)//邮编
    confirm(value, cvalue)//两次值是否一致
    url(value)//url
    int(value)//整数
    float(value)//浮点数
    range(value, min, max)//整数范围
    ip4(value)//ip4
    ip6(value)//ip6
    ip(value)//ip
    date(value)//日期
    in(value, arr)//在一个数组内
上述规则如果仅有一个入参，规则设置方法:

username: {
    method: 'ALL',//新增和更新时都验证
    valid: ['required'], //验证规则
    msg: {
        required: '姓名必填'//验证未通过时的错误提示
    }
}
有多个入参的规则设置方法:

username: {
    method: 'ALL',//新增和更新时都验证
    valid: ['length'],
    length_args: [6],//规则第二个入参
    msg: {
        length: '长度不能小于6'
    }
}
username: {
    method: 'ALL',//新增和更新时都验证
    valid: ['length'],
    length_args: [6, 10],//规则第二个、第三个入参
    msg: {
        length: '长度在6-10之间'
    }
}

扩展自定义验证规则

除了上述默认的验证规则外，我们可以通过函数的方式来自定义验证：

username: {
    method: 'ALL',//新增和更新时都验证
    valid: [
        function(){
            ....
            if(true){
                return {status: 1, msg: ''}
            }else {
                return {status: 0, msg: '验证错误'}
            }
        }, 'required'
    ]
    msg: {
    required: '必填'
    }
}
需要注意的是，验证规则的函数必须是同步方法，并且返回格式固定：

成功要返回{status: 1, msg: ''}

失败时要返回{status: 0, msg: '验证错误信息'}

异步的验证请使用_beforeAdd或_beforeUpdate模型类方法来实现：

//模型类新增前置方法
async _beforeAdd(data, options){
    let num = await this.where({username: data.username}).count();
    if(num > 0){
        return Promise.reject('该用户名已被使用');
    }
}


```



## 文档

[https://www.thinkkoa.org/orm/](https://www.thinkkoa.org/orm/index.jhtml)

## 贡献者

* richenlin
* richerdlee

## 协议


MIT
