/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/24
 */
var path = require('path');
var thinkorm = require('../index.js');
var ObjectID = require('mongodb').ObjectID;
var config = {
    db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 27017,
    db_name: 'test',
    //db_pwd: '',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
};
//thinkorm.require需要使用绝对路径
var User = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/User.js');
var Profile = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Profile.js');
var Pet = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Pet.js');
var Group = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Group.js');

//加载模型类
thinkorm.setCollection(User, config);
thinkorm.setCollection(Profile, config);
thinkorm.setCollection(Pet, config);
thinkorm.setCollection(Group, config);

//实例化模型
var model = new User(config);
//model.add({id: 14, name: 'e', Profile: {id: 10, test: 'aaaaa'}});
model.where({_id:'57bebfa4b5ffadbebe28dc7d'}).rel('Profile').find().then(res=>{
    console.log(res)
})