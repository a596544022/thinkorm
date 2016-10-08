/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
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
    db_pwd: 'richenlin',
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
var model = new User(config);

function test() {
    "use strict";
    return model
        //.migrate()
    //.where({id: {'<>': 1, '>=': 0}, name: 'rrrrrrr', or: [{name: 'aa'}, {name: 'aaa'}], not: {name: 1, id: 2}, notin: {name: [1,2,3]}}).find()
    //.where({id: {'>=': 0}}).count()
    //.where({id: {'>=': 0}}).sum('id')
    //.where({id: {'>=': 0}}).select()
    //.where({name: {'like': 'r%'}}).find()
    //.where({not: {name: '', id: 1}}).select()
    //.where({notin: {'id': [1,2,3]}}).select()
    //.where({name: {'like': '%a'}}).select()
    //.where({id: [1,2,3]}).select()

    //.where({id: {'<>': 1, '>=': 0, notin: [1,2,3]}, name: ['aa', 'rrrrrrr'], notin: {'id': [1,2,3], num: [1,2,3]}, not: {name: '', num: [1,2,3]}, memo: {'like': '%a'}, or: [{name: 'aa', id: 1}, {name: 'rrrrrrr', id: {'>': 1}}]}).find()
    //.where({'and': {id: 1, name: 'aa'}}).find()//and做key
    //.where({or: [{id: 1, name: {or: [{name: 'aa'}, {memo: 'aa'}]}}, {memo: 'aa'}]}).find()//or嵌套
    //.where({in: {id: [1,2,3], num: [2,3]}}).find()//in做key
    //.where({'operator': {id: {'<>': 1, '>=': 0}}}).find()//operator做key
    //.where({name: {'<>': '', not: 'aa', notin: ['aa', 'rrr'], like: '%a'}}).find()

    //.where({id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}}).select()
    //.countSelect()
    //.join([{from: 'Profile', on: {or: [{profile: 'id'}, {username: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //.field(['id','name']).join([{from: 'Profile', on: {or: [{profile: 'id'}, {name: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //.where({id: {'>=': 0}}).group(['id','username']).find()
    .rel(true).where({id: 10}).find()
    // .add({name: 'rrrrrrrrrrrrr',Profile: {test: ['rrrtest']},Pet: [{types: 'ssfsssss'}],Group: [{name: 'ssfsssss'}]})
    //.where({id: 41}).update({name: 'ttttttrrrrr',Profile: {test: ['ttttttt']}})、、、
    //.add({name: 'rrrrrrrrrrrrr',Pet: [{types: 'ssfsssss'}]})
    // .where({id: 1}).update({name: 'ttrrrrrtttt',Pet: [{id: 7,types: 'ttttttt'}]})
    //.add({name: 'rrrrrrrrrrr',Group: [{name: 'ssfsssss', type: ''}]})
    //.where({id: 12}).update({name: 'ttttrrrrrtt',Group: [{id: 55,name: 'ttttttt'}]})
    //.where({id: 115}).update({name: 'ttttrrrrrtt',Group: [{userid: 115, groupid: 15}]})
    //    .query('select * from think_user where id = 1')
    //    .where({id:1}).increment('num', 1)
    //    .add({name: 'qqqesddfsdqqq'})
        .then(res => {
            console.log(res);
        });
}
test();


//function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//var lib = requireDefault(require('../lib/Util/lib.js')).default;
//
//console.log(parseInt(''))
//console.log(lib.isJSONStr(111))
//console.log(lib.isJSONStr(undefined))
//console.log(lib.isJSONStr(''))
//console.log(lib.isJSONStr(null))
//console.log(lib.isJSONStr(false))
//console.log(lib.isJSONStr('[]'))
//console.log(lib.isJSONObj([ RowDataPacket { userid: 1, groupid: 1 } ]))
