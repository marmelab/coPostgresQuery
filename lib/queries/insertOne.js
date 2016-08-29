import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (initialTable, initialFields, initialReturnFields = ['*']) {
    const config = {
        table: initialTable,
        fields: initialFields,
        returnFields: initialReturnFields,
    };

    function insertOne(data) {
        const {
            table,
            fields,
            returnFields,
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
            parameters,
        };
    }

    return configurable(insertOne, config);
}
