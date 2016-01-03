'use strict';

import coPg from 'co-pg';
import pg from 'pg';
var postgresql = coPg(pg);
import * as named from 'node-postgres-named';

export default function* pgClient(dsn) {
    var connect = yield postgresql.connect_(dsn);
    var client = connect[0];

    named.patch(client);

    const query_ = function (queryString, values) {
        return function (cb) {
            client.query(queryString, values, cb);
        };
    };

    const query = function* ({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }
        return (yield query_(sql, parameters)).rows;
    };

    const queryOne = function* ({ sql, parameters }) {
        return (yield query({ sql, parameters }))[0];
    };

    const begin = function* () {
        yield query({ sql: 'BEGIN' });
    };

    const commit = function* () {
        yield query({ sql: 'COMMIT' });
    };

    const savepoint = function* (name) {
        yield query({ sql: 'SAVEPOINT ${name}' });
    };

    const rollback = function* (name) {
        const sql = `ROLLBACK`;

        yield query({ sql: name ? sql.concat(` TO ${name}`) : sql });
    };

    const id = (yield query_('SELECT pg_backend_pid()')).rows[0].pg_backend_pid;

    return {
        done: connect[1],
        query,
        queryOne,
        id,
        begin,
        commit,
        savepoint,
        rollback
    };
}
