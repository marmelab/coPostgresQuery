import pg from 'pg-then';
import co from 'co';
import namedToNumericParameter from '../queries/namedToNumericParameter';
export default function* pgClient(dsn) {
    const client = new pg.Client(dsn);

    const query = function* query({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }
        const result = namedToNumericParameter(sql, parameters);
        const parsedSql = result.sql;
        const parsedParameters = result.parameters;

        return (yield client.query(parsedSql, parsedParameters)).rows;
    };

    const begin = function* begin() {
        yield query({ sql: 'BEGIN' });
    };

    const rollback = function* rollback(name) {
        const sql = 'ROLLBACK';

        yield query({ sql: name ? sql.concat(` TO ${name}`) : sql });
    };

    const commit = function* commit() {
        yield query({ sql: 'COMMIT' });
    };

    const queries = function* queries({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }

        yield begin();
        const result = yield sql.split(';')
        .reduce((prev, sqlLine) => prev.then(() => co(function* handleResult() {
            return yield query({ sql: sqlLine, parameters });
        }))
        .catch(error => co(function* handleError() {
            yield rollback();
            throw error;
        })), Promise.resolve(null));

        yield commit();

        return result;
    };

    const queryOne = function* queryOne({ sql, parameters }) {
        return (yield query({ sql, parameters }))[0];
    };

    const savepoint = function* savePoint(name) {
        yield query({ sql: `SAVEPOINT ${name}` });
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
        rollback,
    };
}
