import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';

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
        const getValueSubQuery = valueSubQuery(fields);
        const values = getValueSubQuery(data);
        const sql = (
`INSERT INTO ${table}
(${values.columns.join(', ')})
VALUES(${values.sql})
RETURNING ${returningFields.join(', ')}`
        );

        return {
            sql,
            parameters: values.parameters
        };
    };

    return configurable(insertOne, config);
};
