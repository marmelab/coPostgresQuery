import batchParameter from './batchParameter';
import configurable from 'configurable.js';
import sanitizeIdentifier from './sanitizeIdentifier';
import combineLiterals from '../utils/combineLiterals';
import whereQuery from './whereQuery';

export default function (table, fields, identifier) {
    let config = {
        table,
        fields,
        identifier
    };

    const batchDelete = function batchDelete(ids) {
        const {
            table,
            fields,
            identifier
        } = config;

        const selector = Array.isArray(identifier) ? identifier : [identifier];

        const idSanitizer = sanitizeIdentifier(selector);
        const cleanIds = ids.map(id => idSanitizer(id));

        const parameters = batchParameter(selector)(cleanIds);

        const where = whereQuery(combineLiterals(cleanIds), selector);

        const sql = `DELETE FROM ${table} ${where} RETURNING ${fields.join(', ')};`;

        return {
            sql,
            parameters
        };
    };

    return configurable(batchDelete, {
        table,
        fields,
        identifier
    });
};
