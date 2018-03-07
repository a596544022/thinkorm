/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');

describe('Query Generation ::', function () {
    describe('Grouping statements with NOTIN', function () {
        it('should generate a query when an NOTIN statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '127.0.0.1',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {notin: {'id': [1,2,3]}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` not in (1, 2, 3)"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '127.0.0.1',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {notin: {'id': [1,2,3]}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" not in (1, 2, 3)"
                    }
                ]
            }, done);
        });
    });
});