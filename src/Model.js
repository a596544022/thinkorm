/**
 * Created by lihao on 16/7/26.
 */
import base from './Base';
import Valid from './Util/valid';
export default class extends base {
    init(name, config = {}) {
        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型
        this.model = {};
        // 模型名称
        this.modelName = '';
        // 数据表前缀
        this.tablePrefix = '';
        // 数据表名（不包含表前缀）
        this.tableName = '';
        // 实际数据表名（包含表前缀）
        this.trueTableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = [];
        // 关联链接
        this._relationLink = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 验证规则
        this._valid = Valid;

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

        this.config = config;

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            //this.tablePrefix = ORM.config('db_prefix');
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = ORM.hash(`${this.config.db_type}_${this.config.db_host}_${this.config.db_port}_${this.config.db_name}`);
    }

    /**
     * 获取数据库适配器单例
     */
    adapter() {
        if (this._adapter) return this._adapter;
        let Adapter = require(`./Adapter/${this.config.db_type || 'mysql'}Adapter`).default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    }

    initModel() {

    }


    /**
     * 获取表模型
     * @param table
     */
    async getSchema(table) {
        table = table || this.getTableName();
        let storeKey = `${this.config.db_type}_${table}_schema`;
        let schema = {};
        if (this.config.schema_force_update) {
            //强制更新schema
            schema = await this.db().getSchema(table);
        } else {
            //TODO缓存schema
            schema = await this.adapter().getSchema(table);
        }

        if (table !== this.getTableName()) {
            return schema;
        }
        //get primary key
        for (let name in schema) {
            if (schema[name].primary) {
                this.pk = name;
                break;
            }
        }
        //merge user set schema config
        this.schema = ORM.extend({}, schema, this.fields);
        return this.schema;
    }

    /**
     * 获取主键
     * @returns {string}
     */
    getPk() {
        return 'id';
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (!this.trueTableName) {
            let tableName = this.config.db_prefix || '';
            tableName += this.tableName || this.parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    }

    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    parseName(name) {
        name = name.trim();
        if (!name) {
            return name;
        }
        //首字母如果是大写，不转义为_x
        name = name[0].toLowerCase() + name.substr(1);
        return name.replace(/[A-Z]/g, function (a) {
            return '_' + a.toLowerCase();
        });
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName() {
        if (this.modelName) {
            return this.modelName;
        }
        let filename = this.__filename || __filename;
        let last = filename.lastIndexOf('/');
        this.modelName = filename.substr(last + 1, filename.length - last - 9);
        return this.modelName;
    }

    /**
     * 查询字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */
    field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
        return this;
    }

    /**
     * 查询条件where
     * @param where
     */
    where(where) {
        if (!where) return this;
        if (ORM.isEmpty(this._options.where)) this._options.where = {
            where: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            },
            orwhere: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            }
        };
        let identifiers = {
            or: 'OR',
            OR: 'OR',
            and: 'AND',
            'AND': 'AND',
            not: 'NOT',
            NOT: 'NOT',
            notin: 'NOTIN',
            NOTIN: 'NOTIN',
            in: 'IN',
            IN: 'IN',
            null: 'NULL',
            NULL: 'NULL',
            notnull: 'NOTNULL',
            NOTNULL: 'NOTNULL',
            between: 'BETWEEN',
            BETWEEN: 'BETWEEN',
            notbetween: 'NOTBETWEEN',
            NOTBETWEEN: 'NOTBETWEEN',
            '>': 'OPERATOR',
            '<': 'OPERATOR',
            '<>': 'OPERATOR',
            '<=': 'OPERATOR',
            '>=': 'OPERATOR',
        }
        /*******************此方法将要将where条件解析为knex可用格式**********************/
        //where = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        //orwhere = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        /**************************************************************************/
        let self = this;
        let parse = function (key, value, k, isor = false) {
            switch (identifiers[key]) {
                case 'OR':
                    for (let m of value) {
                        for (let o in m) {
                            parse(o, m[o], o, true);
                        }
                    }
                    return;
                    break;
                //id:{in:[1,2,3,4]}
                case 'IN':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.in.push([n, value[n]]) : self._options.where.where.in.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.in.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.in.push([n, value[n]]);
                        //}
                    }
                    //return;
                    break;
                case 'NOTIN':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.notin.push([n, value[n]]) : self._options.where.where.notin.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.notin.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.notin.push([n, value[n]]);
                        //}
                    }
                    return;
                    break;
                case 'NULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.null.push(value) : self._options.where.where.null.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;
                case 'NOTNULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.notnull.push(value) : self._options.where.where.notnull.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;

                case 'BETWEEN':
                    isor ? self._options.where.orwhere.between.push([k, value]) : self._options.where.where.between.push([k, value]);
                    return;
                    break;
                case 'NOTBETWEEN':
                    isor ? self._options.where.orwhere.notbetween.push([k, value]) : self._options.where.where.notbetween.push([k, value]);
                    return;
                    break;
                case 'NOT':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.not.push([n, value[n]]) : self._options.where.where.not.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.not.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.not.push([n, value[n]]);
                        //}
                    }

                    break;
                    return;
                case 'OPERATOR':
                    isor ? self._options.where.orwhere.operation.push([k, key, value]) : self._options.where.where.operation.push([k, key, value]);
                    //if (isor) {
                    //    self._options.where.orwhere.operation.push([k, key, value])
                    //} else {
                    //    self._options.where.where.operation.push([k, key, value])
                    //}
                    break;
                    return;
                case 'AND':
                default:
                    if (ORM.isJSONObj(value)) {
                        for (let n in value) {
                            parse(n, value[n], key, isor);
                        }
                        //} else if (isor) {
                        //    self._options.where.orwhere.and.push([key, '=', value]);
                    } else {
                        isor ? self._options.where.orwhere.and.push([key, '=', value]) : self._options.where.where.and.push([key, '=', value]);
                        //self._options.where.where.and.push([key, '=', value]);
                    }
                    return;
                    break;
            }
        }
        for (let key in where) {
            parse(key, where[key]);
        }
        //console.log(this._options.where);
        return this;
    }

    /**
     * 指定查询数量
     * @param offset
     * @param length
     */
    limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (ORM.isArray(offset)) {
            offset = offset[0], length = offset[1];
        }

        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this._options.limit = [offset, length];
        return this;
    }

    /**
     * 排序
     * @param order
     */
    order(order) {
        if (order === undefined) {
            return this;
        }
        //TODO进一步解析
        this._options.order = [];
        //如果是字符串id desc
        if (ORM.isString(order)) {
            //'id desc,name aes'
            if (order.indexOf(',') > -1) {
                let orderarr = order.split(',');
                for (let o of orderarr) {
                    if (o.indexOf(' desc') > -1 || o.indexOf(' DESC') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'desc']);
                    } else if (o.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'aes']);
                    } else {
                        this._options.order.push([o, 'aes']);
                    }
                }
            } else {
                //'id desc'
                if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'desc']);
                } else if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'aes']);
                } else {
                    this._options.order.push([order, 'aes'])
                }
            }

        } else if (ORM.isArray(order)) {
            //[{id: 'asc', name: 'desc'}],
            for (let o of order) {
                for (let k in o) {
                    this._options.order.push([k, o[k]]);
                }
            }
        }
        return this;
    }

    /**
     * 分组
     * @param value
     */
    group(value) {
        this._options.group = value;
        return this;
    }

    /**
     * 关联
     * [{type:'left',from:'user',on:Object||Array}]
     * @param join
     */
    join(join) {
        if (!join) return this;
        let type, onCondition, from, joinArr = [], on, or, orArr;
        for (let j of join) {
            type = j.type || 'left';
            from = j.from;
            onCondition = j.on;
            if (ORM.isObject(onCondition)) {
                //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                if (onCondition.or != undefined) {
                    orArr = [`${this.tablePrefix}${from} AS ${from}`];
                    for (let o of onCondition.or) {
                        or = [];
                        for (let k in o) {
                            or.push(`${k}.${o[k]}`)
                        }
                        orArr.push(or);
                    }
                    //console.log(orArr)
                    //or:['user',[[user.id,info.user_id],[user.name,info.user_name]]]
                    joinArr.push({type: type, from: from, or: orArr})
                } else {
                    //or:{a:'id',b:'a_id'}
                    on = [`${this.tablePrefix}${from} AS ${from}`];
                    for (let k in onCondition) {
                        on.push(`${k}.${onCondition[k]}`);
                    }
                    joinArr.push({type: type, from: from, on: on})
                }
            }
        }
        this._options.join = joinArr;
        return this;
    }

    /**
     * 指定关联操作的表
     * @param table
     */
    rel(table = false) {
        if (ORM.isBoolean(table)) {
            if (table === false) {
                this._options.rel = [];
            } else {
                this._options.rel = true;
            }
        } else {
            if (ORM.isString(table)) {
                table = table.replace(/ +/g, '').split(',');
            }
            this._options.rel = ORM.isArray(table) ? table : [];
        }

        return this;
    }

    async count(field, options) {
        options = await this.parseOptions(options, {count: field});
        let result = await this.adapter().count(options);
    }

    async min(field, options) {
        options = await this.parseOptions(options, {min: field});
        let result = await this.adapter().min(options);
    }

    async max(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.max = field;
        let options = await this.parseOptions(this._options);
        let result = await this.adapter().max(options);
    }

    async avg(field, options) {
        options = await this.parseOptions(this._options, {avg: field});
        let result = await this.adapter().avg(options);
    }

    async avgDistinct(field, options) {
        options = await this.parseOptions(this._options, {avgDistinct: field});
        let result = await this.adapter().avgDistinct(options);
    }

    /**
     * 字段自增
     * @param field
     */
    async increment(field, inc = 1, options) {
        if (ORM.isEmpty(field)) return ORM.error('_INCREMENT_FIELD_EMPTY');
        options = await this.parseOptions(options, {increment: [field, inc]});
        let result = await this.adapter().increment(options);
    }

    /**
     * 字段自减
     * @param field
     */
    async decrement(field, dec = 1, options) {
        if (ORM.isEmpty(field)) return ORM.error('_DECREMENT_FIELD_EMPTY');
        options = await this.parseOptions(options, {decrement: [field, dec]});
        let result = await this.adapter().decrement(options);
    }


    /**
     * 查询一条数据
     * @param option
     */
    async find(options) {
        options = await this.parseOptions(options, {limit: [0, 1]});
        let result = await this.adapter().select(options);
        result = await this.parseData(result[0] || {}, options);
        return this._afterFind(result, options);
    }

    /**
     * 查询后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */
    async _afterFind(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 查询多条数据
     * @param option
     */
    async select(options) {
        options = await this.parseOptions(options);
        let result = await this.adapter().select(options);
        result = await this.parseData(result || [], options);
        return this._afterSelect(result, options);
    }

    /**
     * 查询后只操作
     * @param result
     * @param options
     * @private
     */
    async _afterSelect(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 新增操作
     * @param data
     * @param options
     * @returns {*}
     */
    async add(data, options) {
        if (ORM.isEmpty(data)) return ORM.error('_DATA_TYPE_INVALID_');
        options = await this.parseOptions(options);
        this._data = data;
        this._data = await this.parseData(this._data, options, 1);
        let result = await this.adapter().insert(this._data, options);
        let pk = this.getPk();
        this._data[pk] = this.adapter().getLastInsertId();
        //TODO关联写入
        if (!ORM.isEmpty(this.relation)) {

        }
        this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
        await this._afterAdd(this._data, options);
        return this._data[pk];

    }

    /**
     * 新增后置操作
     * @param data
     * @param opitons
     * @returns {Promise.<*>}
     * @private
     */
    async _afterAdd(data, opitons) {
        return Promise.resolve(data);
    }

    /**
     * 批量写入,不提供关联写入
     * @param data
     * @param options
     * @returns {*}
     */
    async addAll(data, options) {
        //判断是否为数组
        if (!ORM.isArray(data))return ORM.error('DATA MUST BE ARRAY');
        options = await this.parseOptions(options);
        this._data = data;
        let ps = this._data.map(item=> {
            return this.parseData(item, options);
        })
        this._data = await Promise.all(ps)
        return await this.adapter().insertAll(this._data, options);
    }

    /**
     * 更新操作
     * @param data
     * @param options
     */
    async update(data, options) {
        if (ORM.isEmpty(data)) return ORM.error('_DATA_TYPE_INVALID_');
        options = await this.parseOptions(options);
        this._data = data;
        this._data = await this.parseData(this._data, options, 2);
        this._data = await this.adapter().update(this._data, options);
        //TODO关联写入
        if (!ORM.isEmpty(this.relation)) {

        }
        return await this._afterUpdate(this._data, options)
    }

    /**
     * 更新后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */
    async _afterUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 删除前置操作
     * @param options
     * @private
     */
    async _beforeDelte(options) {
        return Promise.resolve(options);
    }

    /**
     * 删除操作
     * @param options
     */
    async delete(options) {
        options = this.parseOptions(options);
        options = await this._beforeDelte(options);
        let result = await this.adapter().delete(options);
        options = await this._afterDel(options);
        return result;
    }

    /**
     * 删除后置操作
     * @param options
     * @private
     */
    async _afterDelte(options) {

    }

    /**
     * 解析参数
     */
    async parseOptions(oriOpts, extraOptions) {
        let options;
        if (ORM.isScalar(oriOpts)) {
            options = ORM.extend({}, this._options);
        } else {
            options = ORM.extend({}, this._options, oriOpts, extraOptions);
        }
        //查询过后清空sql表达式组装 避免影响下次查询
        this._options = {};
        //获取表名
        options.table = options.table || this.getTableName();
        //表前缀，Db里会使用
        options.tablePrefix = this.tablePrefix;
        options.modelName = this.getModelName();

        return options;
    }

    /**
     * 解析数据
     * @param data
     * @param options
     * @param beforeCheck 1:add操作前检查,2:update操作前检查
     */
    async parseData(data, options, beforeCheck = 0) {
        //TODO 数据检查
        return data;
    }
}