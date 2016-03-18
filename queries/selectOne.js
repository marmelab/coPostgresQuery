import configurable from '../utils/configurable';
import whereQuery from './whereQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, idFields, returnFields) {
    let config = {
        table,
        idFields,
        returnFields
    };

    function selectOne(parameters) {
        const {
            table,
            idFields,
            returnFields
        } = config;
        parameters = sanitizeParameter(idFields)(parameters);
        const where = whereQuery(parameters, idFields);

        const sql = `SELECT ${returnFields.join(', ')} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters };
    }

    return configurable(selectOne, config);
}
