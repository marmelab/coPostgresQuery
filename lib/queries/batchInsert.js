import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

export default function (table, fields, returnFields = '*') {
    let config = {
        table,
        fields,
        returnFields
    };

    function batchInsert(entities) {
        let {
            table,
            fields,
            returnFields
        } = config;
        if (!entities || entities.length === 0) {
            throw new Error(`No data for batch inserting ${table} entities.`);
        }

        const parameters = batchParameter(fields)(entities);
        const getValueSubQuery = valueSubQuery(fields);

        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const values = entities
        .map((entity, index) => getValueSubQuery(index))
        .reduce((result, sql, index) => result.concat(`(${sql})`), [])
        .join(', ');

        const sql = `INSERT INTO ${table}(${fields.join(', ')}) VALUES ${values} RETURNING ${returnFields};`;

        return { sql, parameters };
    };

    return configurable(batchInsert, config);
};
