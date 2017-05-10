import pg from 'pg';
import namedToNumericParameter from '../queries/namedToNumericParameter';
import arrayToLitteral from '../utils/arrayToLitteral';

const iterate = async (query, it, data = it.next()) => {
    if (data.done) {
        return data.value;
    }
    if (Array.isArray(data.value)) {
        const nextValue = await Promise.all(data.value.map(val => query(val)))
            .then(result => it.next(result), error => it.throw(error));

        return iterate(query, it, nextValue);
    }

    if (typeof data.value === 'object' && typeof data.value.sql === 'undefined') {
        const keys = Object.keys(data.value);
        const nextValue = await Promise.all(keys
            .map(key => query(data.value[key]))
        )
        .then(result => arrayToLitteral(keys, result))
        .then(result => it.next(result), error => it.throw(error));

        return iterate(query, it, nextValue);
    }

    const nextValue = await query(data.value)
        .then(result => it.next(result), error => it.throw(error));

    return iterate(query, it, nextValue);
};

function setupClient(client, isPool = false) {
    const query = async ({ sql, parameters, returnOne }) => {
        if (sql === null) {
            throw new Error('sql cannot be null');
        }

        if (sql === '') {
            return returnOne ? null : [];
        }

        const { sql: parsedSql, parameters: parsedParameters } = namedToNumericParameter(sql, parameters);

        const result = await client.query(parsedSql, parsedParameters).then(queryResult => queryResult.rows);
        if (returnOne && result.length > 1) {
            console.warn(`Query supposed to return only one result but got ${result.length}`);
        }

        return returnOne ? result[0] : result;
    };

    const noTransaction = () => {
        throw new Error(
            'You must create a client with connect to be able to use transaction. Default pool.query will change client on each call.'
        );
    };

    const begin = isPool ? noTransaction : () => query({ sql: 'BEGIN' });

    const sqlForRollback = 'ROLLBACK';
    const rollback = isPool ? noTransaction : name => query({ sql: name ? sqlForRollback.concat(` TO ${name}`) : sqlForRollback });

    const commit = isPool ? noTransaction : () => query({ sql: 'COMMIT' });

    const savepoint = isPool ? noTransaction : name => query({ sql: `SAVEPOINT ${name}` });

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

    const linkOne = (querier) =>
        (...args) => query(querier(...args));

    const link = (querier) => {
        if (typeof querier === 'function') {
            return linkOne(querier);
        }

        return Object.keys(querier).reduce((result, key) => ({
            ...result,
            [key]: linkOne(querier[key], key),
        }), {});
    };

    const saga = (gen) => async (...args) =>
        iterate(query, gen(...args));

    return {
        ...client,
        end: client.end.bind(client),
        query,
        queries,
        begin,
        commit,
        savepoint,
        rollback,
        link,
        saga,
    };
}

export default function PgPool({ user, password, database, host, port }, config = { max: 10, idleTimeoutMillis: 30000 }) {
    const pool = new pg.Pool({
        user,
        password,
        database,
        host,
        port,
        max: config.max,
        idleTimeoutMillis: config.idleTimeoutMillis,
    });

    const connect = () => pool.connect().then(setupClient);

    return {
        ...setupClient(pool, true),
        connect,
    };
}
