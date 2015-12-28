import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';

export default function (table, fields, returnFields = '*') {
    let config = {
        table,
        fields,
        returnFields
    };

    function batchInsert(entities) {
        const {
            table,
            fields,
            returnFields
        } = config;
        const getValueSubQuery = valueSubQuery(fields);

        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const { values, parameters } = entities
        .map((entity, index) => getValueSubQuery(entity, index + 1))
        .reduce((result, value, index) => ({
            parameters: {...result.parameters, ...value.parameters},
            values: result.values.concat(`(${value.sql})`)
        }), { values: [], parameters: {} });

        const sql = `INSERT INTO ${table}(${fields.join(', ')}) VALUES ${values.join(', ')} RETURNING ${returnFields}`;

        return { sql, parameters };
    };

    return configurable(batchInsert, config);
};
