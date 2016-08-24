import configurable from 'configurable.js';
import whereQuery from './whereQuery';
import sanitizeIdentifier from './sanitizeIdentifier';

export default function (initialTable, initialIdFields, initialReturnFields) {
    const config = {
        table: initialTable,
        idFields: initialIdFields,
        returnFields: initialReturnFields,
    };

    function selectOne(rawParameters) {
        const {
            table,
            idFields,
            returnFields,
        } = config;
        const parameters = sanitizeIdentifier(idFields)(rawParameters);
        const where = whereQuery(parameters, idFields);

        const sql = `SELECT ${returnFields.join(', ')} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters };
    }

    return configurable(selectOne, config);
}
