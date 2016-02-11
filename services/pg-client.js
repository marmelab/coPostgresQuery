'use strict';

import pg from 'pg-then';

var tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9_]*)\b/g;

function numericFromNamed(sql, parameters = {}) {
    var fillableTokens = Object.keys(parameters);
    var matchedTokens = sql.match(tokenPattern);
    if (!matchedTokens) {
        return { sql, parameters: [] };
    }
    matchedTokens = matchedTokens
    .map((token)=> token.substring(1)) // Remove leading dollar sign
    .filter((value, index, self) => self.indexOf(value) === index);

    var fillTokens = fillableTokens.filter((value) => matchedTokens.indexOf(value) > -1);
    var fillValues = fillTokens.map(function (token) {
        return parameters[token];
    });

    var unmatchedTokens = matchedTokens.filter((value) => fillableTokens.indexOf(value) < 0);

    if (unmatchedTokens.length) {
        var missing = unmatchedTokens.join(', ');
        throw new Error(`Missing Parameters: ${missing}`);
    }

    var interpolatedSql = fillTokens.reduce(function (partiallyInterpolated, token, index) {
        var replaceAllPattern = new RegExp(`\\$${fillTokens[index]}\\b`, 'g');
        return partiallyInterpolated
        .replace(replaceAllPattern, `$${index + 1}`); // PostGreSQL parameters are inexplicably 1-indexed.
    }, sql);

    var out = {};
    out.sql = interpolatedSql;
    out.parameters = fillValues;

    return out;
}

export default function* pgClient(dsn) {
    var client = new pg.Client(dsn);

    const query = function* ({ sql, parameters }) {
        if (!sql) {
            throw new Error('sql cannot be null');
        }
        const result = numericFromNamed(sql, parameters);
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
