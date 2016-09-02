import pg from 'pg';
import namedToNumericParameter from '../queries/namedToNumericParameter';

export default ({ user, password, database, host, port }, config = { max: 10, idleTimeoutMillis: 30000 }) => {
    const client = new pg.Pool({
        user,
        password,
        database,
        host,
        port,
        max: config.max,
        idleTimeoutMillis: config.idleTimeoutMillis,
    });

    const query = ({ sql, parameters }) => {
        if (!sql) {
            throw new Error('sql cannot be null');
        }
        const result = namedToNumericParameter(sql, parameters);
        const parsedSql = result.sql;
        const parsedParameters = result.parameters;

        return client.query(parsedSql, parsedParameters).then(queryResult => queryResult.rows);
    };

    const begin = () => query({ sql: 'BEGIN' });

    const sqlForRollback = 'ROLLBACK';
    const rollback = name => query({ sql: name ? sqlForRollback.concat(` TO ${name}`) : sqlForRollback });

    const commit = () => query({ sql: 'COMMIT' });

    const queries = ({ sql, parameters }) => {
        if (!sql) {
            throw new Error('sql cannot be null');
        }

        return begin()
        .then(
            () => sql
            .split(';')
            .reduce(
                (prev, sqlLine) => prev.then(() => query({ sql: sqlLine, parameters }))
                .catch(error => rollback().then(() => {
                    throw error;
                })),
                Promise.resolve(null)
            )
        )
        .then(results => commit().then(() => results));
    };

    const queryOne = ({ sql, parameters }) => query({ sql, parameters }).then(result => result[0]);

    const savepoint = name => query({ sql: `SAVEPOINT ${name}` });

    return {
        ...client,
        done: client.end.bind(client),
        query,
        queries,
        queryOne,
        begin,
        commit,
        savepoint,
        rollback,
    };
};
