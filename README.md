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

## 事务

```
ThinkORM目前支持Mysql、postgreSQL的事务操作，代码示例：


//实例化模型
let model = new user(config);

//开始事务
return model.transaction(async function (t) {
//同步模式
// for (var i = 1; i < 5; i++) {
// await model.add({name: 'rrrrrrrrrrrrr'});
// await model.add({name: 'rrrrrrr'});
// await model.add({name: 'rrrrrrrrrrrrr'});
// }

//Promise.all并行模式
//var ps = [];
//for (var i = 1; i < 5; i++) {
// ps.push(model.add({name: 'rrrrrrrrrrrrr'}));
// ps.push(model.add({name: 'rrrr'}));
// ps.push(model.add({name: 'rrrrrrrrrrrrr'}));
//}
//return Promise.all(ps);

    //跨模型执行
    await model.add({name: 'rrrrrrrrrrrrr'}); //主模型写入数据
    let profileModel = await THINK.model('Common/Profile', {}).initDB(t);//实例化profile模型
    return profileModel.add({test: ['rrrtest']});//profile模型写入数据
}).then(data => {
console.log(data);//事务commit后打印
});


```

## 关联模型

```
关联模型的定义
ThinkORM支持表的一对一、一对多、多对多关联关系,标准的关联关系定义格式：

例如user.js类中申明的关联关系：

const {relModel, helper} = require('thinkorm');
const Profile = require('./.Profile.js');
const Pet = require('./.Pet.js');
const Group = require('./.Group.js');
const UserGroup = require('./.UserGroup.js');

module.exports = class extends relModel {
    init(){
        // 模型名称
        this.modelName = 'User';
        // 是否开启迁移(migrate方法可用)
        this.safe = false;
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
            },
            num: {
                type: 'integer',
                index: true,
                defaults: 0
            },
            memo: {
                type: 'text',
                defaults: ''
            },
            create_time: {
                type: 'integer',
                defaults: 0
            }
        };
        // 数据验证
        this.validations = {
            name: {
                method: 'ALL', //ADD 新增时检查, UPDATE 更新时检查, ALL 新增和更新都检查,如果属性不存在则不检查
                valid: ['required', 'length'],
                length_args: 10,
                msg: {
                    required: '姓名必填',
                    length: '姓名长度必须大于10'
                }
            }
        };
        // 关联关系
        this.relations = {
            Profile: {
                type: 'hasone', //关联方式
                model: Profile, //子表模型
                //field: ['test', 'id'],//关联表字段
                fkey: 'profile', //主表外键 (子表主键)
                rkey: 'id' //子表主键
            },
            Pet: {
                type: 'hasmany',
                model: Pet, //子表模型
                //field: ['types','user', 'id'],
                fkey: '', //hasmany关联此值没用
                rkey: 'user'//子表外键 (主表主键)
            },
            Group: {
                type: 'manytomany',
                model: Group, //子表模型
                //field: ['name', 'type', 'id'],
                fkey: 'userid', //map外键(主表主键)
                rkey: 'groupid', //map外键(子表主键)
                map: UserGroup//map模型
            }
        };
    }
};

relation属性是一个对象，对象的每一个key都代表着一个关联关系。key对应一个模型类。key的定义必须是准确的模型名。

type
关联关系类型，支持hasone,hasmany,manytomany

type的值不区分大小写，可以是hasone或者HASONE,还可以简写成1，hasmany简写为2，manytomany简写为3

field
field申明了关联模型在查询的时候筛选的字段，例如上述的Profile中field的值为['test','id'],表示关联查询Profile的时候仅返回 test及id两个字段。如果该属性不存在,在关联查询的时候默认返回关联表所有字段

fkey/rkey
fkey/rkey主要定义了关联模型中的主键及外键名，具体含义见上述注释

### 关联模型的查询

为提高执行效率，ThinkORM默认不会进行关联查询，即使模型类中已经定义了关联关系，如果需要进行关联查询，则通过Model类的rel方法来打开。

#### rel\(table = false\[, fields])

类型：非中断方法

参数：

table 可传入布尔值 true或false 表示开启或关闭关联查询如果传入的是模型名，则仅关联查询传入的模型（模型类关联多个子表的情况下）


fields: 指定关联查询关联表的筛选字段

.rel(true,{profile: ['name'], pet: ['types']})


作用：配合查询方法使用，是否开启表关联查询，默认为关闭。


在本章的开头，定义了UserModel类的关联关系，User模型有2个关联，分别是一对一关联Profile，一对多关联Pet。如果我们在查询中仅需要Profile的关联结果，那么可以在rel方法中传入Profile
UserModel.rel('Profile').find();//注意这里的Profile为模型名，同关联定义的key一致


#### hasone关联查询
UserModel.rel('profile').find(); //{"id":1,"title":"test","profile":{"test": "profile", "id": 1}}

#### hasmany关联查询
UserModel.rel('ppet').find(); //{"id":1,"title":"test","pet":[{"types": "cat", "user": 1, "id": 1}]}

#### manytomany关联查询
UserModel.rel('group').find(); //{"id":1,"title":"test","group":[{"name": "aa", "type": 1, "id": 1}]} `

```

## 模型类方法

```
链式操作
ThinkORM的模型使用了方便而直观的链式操作，例如:

userModel.where({id:1}).field('username').find();
链式操作需要注意的两点：

1、query原生查询方法不支持链式操作

userModel.query('select * from think_user').find(); //错误
2、非中断式方法(field、where、order等)后可以跟随链式，而中断式方法必须放在链式操作的结尾(find、update等)

例如：

userModel.where({id:1}).field('username').order('id desc').find(); //正确

userModel.where({id:1}).field('username').find().order('id desc'); //错误
常用的模型类方法
getTableName()
方法说明：

类型	作用
中断方法	获取模型类对应的数据库表名
getPk()
方法说明：

类型	作用
中断方法	获取模型类对应的数据库表主键
userModel.getPk();
alias(alias)
类型	作用
非中断方法	配合find、select等查询方法可以自定义表的查询别名
参数说明：

参数	说明
alias	接受字符串
limit(skip, limit)
方法说明：

类型	作用
非中断方法	配合find、select等查询方法可以获取指定区间的数据记录
userModel.limit(1).find();
userModel.limit(10, 20).find();
userModel.limit([10, 10]).find();
参数	说明
skip	起跳记录数（int）
limit	需要获取的记录数 (int)
order(order)
方法说明：

类型	作用
非中断方法	配合find、select等查询方法可以根据规则将数据记录排序
参数说明：

参数	说明
order	接受对象{id: 'desc'}
userModel.order({'name': 'asc', 'id': 'desc'})
rel(rels = true{, options})
方法说明：

类型	作用
非中断方法	配合find、select等查询开启表关联查询;配合add方法开启关联新增；配合update方法开启关联更新
参数说明：

参数	说明
rels	可传入布尔值 true或false 表示开启或关闭关联查询如果传入的是模型名，则仅关联查询传入的模型（模型类关联多个子表的情况下）
options	指定关联表的查询选项
例子：

userModel.rel(true, {Profile: {field: ['name'], where: {name: {'<>': ''}}}})

or

userModel.rel(['Profile'],{Profile: {field: ['name'], where: {name: {'<>': ''}}}})
field([fields])
方法说明：

类型	作用
非中断方法	配合find、select等查询方法使用，筛选输出查询结果字段
参数说明：

参数	说明
fields	可接受数组
field(['username', 'phone'])
where(where)
方法说明：

类型	作用
非中断方法	定义查询或操作条件
参数说明：

参数	说明
where	接受对象（请参考查询语言章节）
//or:  
where({or: [{...}, {...}]})
//not: 
where({not: {name: '', id: 1}})
//notin: 
where({notin: {'id': [1,2,3]}})
// in: 
where({id: [1,2,3]})
// and: 
where({id: 1, name: 'a'},)
// operator: 
where({id: {'<>': 1}})
// operator: 
where({id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}})
// like: 
where({name: {'like': '%a'}})
join(joinArray)
方法说明：

类型	作用
非中断方法	join查询。支持left、right、inner三种join。mongodb暂时不支持
参数说明：

参数	说明
joinArray	接受一个数组，数组的每一个元素都代表一次join操作
例子：

UserModel.join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}]).find()
//mysql
select User.*, Test.id as Test_id, Test.name as Test_name join test as Test on User.aaa = Test.bbb and User.ccc = Test.ddd limit 1
group(group)
方法说明：

类型	作用
非中断方法	group查询
参数说明：

参数	说明
group	group可以接收一个字符串或一个数组
例子：

.group('name').find()

.group(['id', 'name']).find()
distinct(values)
方法说明：

类型	作用
非中断方法	分拣去重
参数说明：

参数	说明
values	values可以接收一个数组
例子：


.distinct(['id', 'name']).group(['id', 'name'])
having(values)
方法说明：

类型	作用
非中断方法	配合group方法使用做分组筛选
参数说明：

参数	说明
values	value可以接收一个对象
例子：


.having({"id":{">": 100}}).group(['id', 'name'])
add(data[, options])
方法说明：

类型	作用
中断方法	操作数据库新增一条传入的数据对象
参数说明：

参数	说明
data	传入需要新增的对象
options	可选参数。扩展项
例子：

add({username: 'test', phone: '13333333333'})
options 可选参数

add({xxx}, {verify: true})等同于verify(true).add({xxxx})
thenAdd(data[, options])
方法说明：

类型	作用
中断方法	需要配合where传入条件。根据条件查询数据库是否存在记录，不存在则新增
参数说明：

参数	说明
data	传入需要新增的对象
options	可选参数。扩展项
例子：

where({id: 1}).thenAdd({username: 'test', phone: '13333333333'})
options 可选参数，用于扩展。

thenAdd({username: 'test', phone: '13333333333'},{where: {id: 1}})
等同于
where({id: 1}).thenAdd({username: 'test', phone: '13333333333'})
作用：根据条件查询数据库是否存在记录，不存在则新增。

delete([options])
方法说明：

类型	作用
中断方法	需要配合where传入条件。删除数据库记录。注意不允许无条件操作
参数说明：

参数	说明
options	可选参数。扩展项
例子：

where({id:1}).delete()
options 可选参数，用于扩展。

delete({where: {id: 1}}) 等同于 where({id: 1}).delete()
update(data[, options])
方法说明：

类型	作用
中断方法	需要配合where传入条件。更新数据库记录。注意不允许无条件操作
参数说明：

参数	说明
options	可选参数。扩展项
例子：

where({id:1}).update({username: 'aaa'})
options 可选参数，用于扩展。

update({username: 'test', phone: '13333333333'},{where: {id: 1}})
等同于
where({id: 1}).update({username: 'test', phone: '13333333333'})
increment(field[, setp, data, options])
方法说明：

类型	作用
中断方法	数据字段自增
参数说明：

参数	说明
field	需要自增的字段名
setp	步长,默认值为1
data	需要更新的其他字段
options	可选参数，用于扩展
decrement(field[, setp, data, options])
方法说明：

类型	作用
中断方法	数据字段自减
参数说明：

参数	说明
field	需要自减的字段名
setp	步长,默认值为1
data	需要更新的其他字段
options	可选参数，用于扩展
find([options])
方法说明：

类型	作用
中断方法	查询一条数据库记录
参数说明：

参数	说明
options	可选参数，用于扩展
例子：

where({id:1}).find()
count([field, options])
方法说明：

类型	作用
中断方法	统计数据库记录数
参数说明：

参数	说明
field	计数的字段,如果此参数未传入，默认为主键
options	可选参数，用于扩展
例子：

where({id:1}).count()
sum(field[, options])
方法说明：

类型	作用
中断方法	统计数据库记录求传入字段的和
参数说明：

参数	说明
field	计数的字段,如果此参数未传入，默认为主键
options	可选参数，用于扩展
例子：

where({id:1}).sum('score')
select([options])
方法说明：

类型	作用
中断方法	查询多条数据库记录
参数说明：

参数	说明
options	可选参数，用于扩展
countSelect([options, pageFlag])
方法说明：

类型	作用
中断方法	分页查询多条数据库记录，并按照分页格式返回
参数说明：

参数	说明
options	可选参数，用于扩展
pageFlag	可选参数，当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
前置及后置方法
ThinkORM内置了丰富的前后置方法，方便进行模型操作的前置及后置处理。

//新增前置方法 _beforeAdd (data, options)
//新增后置方法 _afterAdd(data, options)
//删除前置方法 _beforeDelete(options)
//删除后置方法 _afterDelete(options）
//更新前置方法 _beforeUpdate(data, options)
//更新后置方法 _afterUpdate(data, options)
//单条查询后置方法 _afterFind(result, options)
//多条查询后置方法 _afterSelect(result, options)
例如我们删除一个用户，同时想删除资料表中用户上传的资料，我们就可以使用删除后置方法

//删除后置方法
async _afterDelete(options) {
    await userModel.where({userid:options.where.userid}).delete();
    return getPromise(options);
}

```

## 模型类属性
```
属性的定义
创建一个模型类，我们需要定义以下几个主要的属性：

// 模型名称
this.modelName = 'user';
// 主键
this.pk = 'id';
// 数据表名 可不用设置,默认为表前缀+模型名(小写,单词以下划线分隔)
this.tableName = 'think_user';
// 数据表字段信息
this.fields = {};
// 数据验证
this.validations = {};
// 关联关系(仅继承relModel有效)
this.relations = {};

modelName
定义模型名称，在关联模型描述中使用。

tableName
定义数据库表名称。如果未设置（属性不存在），默认值为 表前缀+模型名(小写,单词以下划线分隔)：

user => think_user

user_profile => think_user_profile

UserGroup => think_user_group

fields:
定义数据字段，格式为：


title: {
    type: 'string',
    index: true,
    size: 100,
    required: true,
    unique: true,
    pk: true
}

属性	描述	描述
type	数据字段类型	见下表
size	数据字段长度	值为整数
defaults	数据字段默认值	根据字段类型取值，json默认值为{}或[]，array默认值为[]
required	数据字段是否必须有值	true或false
unique	数据字段值唯一	true或false
index	是否索引	true或false
pk	是否主键	true或false
字段数据类型	描述
string	字符型
text	文本型
integer	整型
float	浮点型
json	json格式
array	数组格式
validations:
validations属性定义了模型类的验证规则。如果验证返回错误，会中断新增及更新操作。定义格式：


this.validations = {
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

属性	描述
method	触发验证的操作。ALL新增和更新均验证，ADD新增时验证，UPDATE更新时验证。
valid	验证规则，多个验证规则使用数组
msg	当某个规则未通过时返回的错误提示。msg对象的key和规则名对应
使用方法:


userModel.add(data);//自动验证规则定义的type字段,phonenum新增不会验证

userModel.where({id: 1}).update(data);//data如果包含phonenum则验证

valid定义规则，支持多个规则匹配，msg则定义了不满足规则时的错误提示。

详细说明见数据验证

relations
定义了模型关联关系，仅当模型继承了relModel类才生效。详细用法请参照文档：关联模型
```

## 文档

[https://www.thinkkoa.org/orm/](https://www.thinkkoa.org/orm/index.jhtml)

## 贡献者

* richenlin
* richerdlee

## 协议


MIT
