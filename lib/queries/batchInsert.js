import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

function batchInsert(entities) {
    const {
        table,
        fields,
    } = this.config;

    let { returnFields } = this.config;

    if (!entities || entities.length === 0) {
        throw new Error(`No data for batch inserting ${table} entities.`);
    }

    const parameters = batchParameter(fields)(entities);
    const getValueSubQuery = valueSubQuery(fields);

    if (Array.isArray(returnFields)) {
        returnFields = returnFields.join(', ');
    }

    const values = entities
    .map((entity, index) => getValueSubQuery(index + 1))
    .reduce((result, sql) => result.concat(`(${sql})`), [])
    .join(', ');

    const sql = `INSERT INTO ${table}(${fields.join(', ')}) VALUES ${values} RETURNING ${returnFields};`;

    return { sql, parameters };
}

export default ({ table, fields, returnFields = '*' } = {}) =>
    configurable(batchInsert, { table, fields, returnFields });
