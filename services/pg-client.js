'use strict';

import pg from 'pg-then';
import namedToNumericParameter from '../queries/namedToNumericParameter';

export default function* pgClient(dsn) {
    var client = new pg.Client(dsn);

    const query = function* ({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }
        const result = namedToNumericParameter(sql, parameters);
        const parsedSql = result.sql;
        const parsedParameters = result.parameters;

        return (yield client.query(parsedSql, parsedParameters)).rows;
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

    const id = (yield client.query('SELECT pg_backend_pid()')).rows[0].pg_backend_pid;

    return {
        ...client,
        done: client.end.bind(client),
        query,
        queryOne,
        id,
        begin,
        commit,
        savepoint,
        rollback
    };
}
