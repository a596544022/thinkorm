# 介绍
-----
[![npm version](https://badge.fury.io/js/thinkorm.svg)](https://badge.fury.io/js/thinkorm)
[![Build Status](https://travis-ci.org/richenlin/thinkorm.svg?branch=master)](https://travis-ci.org/richenlin/thinkorm)
[![Dependency Status](https://david-dm.org/richenlin/thinkorm.svg)](https://david-dm.org/richenlin/thinkorm)

ThinkORM, A flexible, lightweight and powerful Object-Relational Mapper for Node.js.

# 特性
-----

1. 支持 Mysql,MongoDB,postgresSql 数据库,且书写语法一致
2. 支持hasone,hasmany,manytomany关联查询,新增,更新
3. 支持left,right,inner join查询(mongo暂不支持)
4. 支持连接池配置
5. 支持事务操作(mysql, postgresql)
6. 支持 _before，_after等多种魔术方法

# 计划
-----

1. mongodb的join查询
2. mongodb的数据严格数据检查

# 示例
-----
```
var path = require('path');
var thinkorm = require('../index.js');

var config = {
    db_type: 'mysql',
    //db_type: 'postgresql',
    //db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 3306,
    //db_port: 5432,
    //db_port: 27017,
    db_name: 'test',
    db_user: 'root',
    //db_user: '',
    db_pwd: '',
    //db_pwd: '',
    db_prefix: 'think_',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
};

//thinkorm.require需要使用绝对路径
var User = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/User.js');
var Profile = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Profile.js');
var Pet = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Pet.js');
var Group = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Group.js');

//加载模型类
thinkorm.setCollection(User, config);
thinkorm.setCollection(Profile, config);
thinkorm.setCollection(Pet, config);
thinkorm.setCollection(Group, config);

//实例化模型
let model = new User(config);

function test() {
    "use strict";
    return model
    //and,or条件
    //.where({id: {'<>': 1, '>=': 0}, name: '', or: [{name: 'aa'}, {name: 'aaa'}]}).find()
    //count查询
    //.where({id: {'>=': 0}}).count()
    //sum查询
    //.where({id: {'>=': 0}}).sum('id')
    //select查询
    //.where({id: {'>=': 0}}).select()
    //分页格式数据查询
    //.countSelect()
    //join查询
    //.join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //带field的join
    //.field(['id','username']).join([{from: 'Profile', on: {or: [{profile: 'id'}, {username: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //group查询
    //.where({id: {'>=': 0}}).group(['id','username']).find()
    //全关联查询
    .rel(true).find()
    //hasone关联新增
    //.add({username: 'rrrrrrr',Profile: {test: 'rrrtest'}})
    //hasone关联更新
    //.where({id: 60}).update({username: 'tttttt',Profile: {test: 'ttttttt'}})
    //hasmany关联新增
    //.add({username: 'rrrrrrr',Pet: [{types: 'ssfsssss'}]})
    //hasmany关联更新
    //.where({id: 99}).update({username: 'tttttt',Pet: [{id: 7,types: 'ttttttt'}]})
    //manytomany关联新增
    //.add({username: 'rrrrrrr',Group: [{name: 'ssfsssss'}]})
    //manytomany关联更新,更新关联子表
    //.where({id: 115}).update({username: 'tttttt',Group: [{id: 15,name: 'ttttttt'}]})
    //manymany关联更新,更新map表
    //.where({id: 115}).update({username: 'tttttt',Group: [{userid: 115, groupid: 15}]})
        .then(res => {
            console.log(res);
        });
}
test();

```



# 贡献者
-----

richenlin
richerdlee

# 协议
-----

MIT