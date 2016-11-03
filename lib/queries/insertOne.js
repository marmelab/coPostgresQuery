import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

function insertOne(data) {
    const {
        table,
        fields,
        returnFields,
    } = this.config;

    const parameters = sanitizeParameter(fields, data);
    const keys = Object.keys(parameters);
    const values = valueSubQuery(keys, '');
    const sql = (
`INSERT INTO ${table}
(${keys.join(', ')})
VALUES(${values})
RETURNING ${returnFields.join(', ')}`
    );

    return {
        sql,
        parameters,
    };
}

export default function (table, fields, returnFields = ['*']) {
    const config = {
        table,
        fields,
        returnFields,
    };

    return configurable(insertOne, config);
}
