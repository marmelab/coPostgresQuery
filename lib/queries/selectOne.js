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

export default function (table, idFields, returnFields) {
    const config = {
        table,
        idFields,
        returnFields,
    };

    return configurable(selectOne, config);
}
