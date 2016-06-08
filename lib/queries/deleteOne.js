import configurable from 'configurable.js';
import sanitizeIdentifier from './sanitizeIdentifier';
import whereQuery from './whereQuery';

export default function (table, idFields, returnFields = ['*']) {
    let config = {
        table,
        idFields,
        returnFields
    };

    function deleteOne(id) {
        const {
            table,
            idFields,
            returnFields
        } = config;

        const parameters = sanitizeIdentifier(idFields, id);
        const where = whereQuery(parameters, idFields);
        const sql = `DELETE FROM ${table} ${where} RETURNING ${returnFields.join(', ')}`;

        return {sql, parameters};
    };

    return configurable(deleteOne, config);
};
