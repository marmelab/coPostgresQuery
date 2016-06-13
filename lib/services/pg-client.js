import pg from 'pg-then';
import co from 'co';
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

    const queries = function* ({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }

        yield begin();
        const result = yield sql.split(';')
        .reduce((prev, sqlLine) => prev.then(function () {
            return co(function* () {
                return yield query({ sql: sqlLine, parameters });
            });
        }), Promise.resolve(null))
        .catch(error => co(function* () {
            yield rollback();
            throw error;
        }));

        yield commit();

        return result;
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
        yield query({ sql: `SAVEPOINT ${name}` });
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
        queries,
        queryOne,
        id,
        begin,
        commit,
        savepoint,
        rollback
    };
}
