import configurable from 'configurable.js';
import whereQuery from './whereQuery';
import sanitizeIdentifier from './sanitizeIdentifier';

function selectOne(rawParameters) {
    const {
        table,
        idFields,
        returnFields,
    } = this.config;
    const parameters = sanitizeIdentifier(idFields)(rawParameters);
    const where = whereQuery(parameters, idFields);

    const sql = `SELECT ${returnFields.join(', ')} FROM ${table} ${where} LIMIT 1`;

    return { sql, parameters };
}

export default ({ table, idFields, returnFields } = {}) =>
    configurable(selectOne, { table, idFields, returnFields });
