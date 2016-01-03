import configurable from '../utils/configurable';
import sanitizeIdentifier from './sanitizeIdentifier';
import whereQuery from './whereQuery';

export default function (table, idFields, returningFields = ['*']) {
    let config = {
        table,
        idFields,
        returningFields
    };

    function deleteOne(id) {
        const {
            table,
            idFields,
            returningFields
        } = config;

        const parameters = sanitizeIdentifier(idFields, id);
        const where = whereQuery(parameters, idFields);
        const sql = `DELETE FROM ${table} ${where} RETURNING ${returningFields.join(', ')}`;

        return {sql, parameters};
    };

    return configurable(deleteOne, config);
};
