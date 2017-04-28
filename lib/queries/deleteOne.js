import configurable from 'configurable.js';
import sanitizeIdentifier from './sanitizeIdentifier';
import whereQuery from './whereQuery';

function deleteOne(id) {
    const {
        table,
        idFields,
        returnFields,
    } = this.config;

    const parameters = sanitizeIdentifier(idFields, id);
    const where = whereQuery(parameters, idFields);
    const sql = `DELETE FROM ${table} ${where} RETURNING ${returnFields.join(', ')}`;

    return { sql, parameters };
}

export default ({ table, idFields, returnFields = ['*'] } = {}) =>
    configurable(deleteOne, {
        table,
        idFields,
        returnFields,
    });
