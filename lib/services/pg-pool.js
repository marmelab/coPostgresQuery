import pg from 'pg';
import namedToNumericParameter from '../queries/helpers/namedToNumericParameter';
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
            .map(key => query(data.value[key])) )
            .then(result => arrayToLitteral(keys, result))
            .then(result => it.next(result), error => it.throw(error));

        return iterate(query, it, nextValue);
    }

    const nextValue = await query(data.value)
        .then(result => it.next(result), error => it.throw(error));

    return iterate(query, it, nextValue);
};

function setupClient(client) {
    const query = async (named, parameters = named.parameters, returnOne = named.returnOne) => {
        const sql = typeof named === 'object' ? named.sql : named;

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

    const linkOne = querier => (...args) => query(querier(...args));

    const link = (querier) => {
        if (typeof querier === 'function') {
            return linkOne(querier);
        }

        return Object.keys(querier).reduce((result, key) => ({
            ...result,
            [key]: linkOne(querier[key], key),
        }), {});
    };

    const saga = iterator => iterate(query, iterator);

    return {
        ...client,
        end: client.end.bind(client),
        query,
        link,
        saga,
    };
}

export default function PgPool({
    user, password, database, host, port,
}, config = { max: 10, idleTimeoutMillis: 30000 }) {
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
        ...setupClient(pool),
        connect,
        originalPool: pool,
    };
}
