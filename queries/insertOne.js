import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, fields, returningFields = ['*']) {
    let config = {
        table,
        fields,
        returningFields
    };

    function insertOne(data) {
        const {
            table,
            fields,
            returningFields
        } = config;

        const parameters = sanitizeParameter(fields, data);
        const values = valueSubQuery(fields, '');
        const sql = (
`INSERT INTO ${table}
(${Object.keys(parameters).join(', ')})
VALUES(${values})
RETURNING ${returningFields.join(', ')}`
        );

        return {
            sql,
            parameters
        };
    };

    return configurable(insertOne, config);
};
