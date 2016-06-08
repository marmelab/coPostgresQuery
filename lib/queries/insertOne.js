import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, fields, returnFields = ['*']) {
    let config = {
        table,
        fields,
        returnFields
    };

    function insertOne(data) {
        const {
            table,
            fields,
            returnFields
        } = config;

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
            parameters
        };
    };

    return configurable(insertOne, config);
};
