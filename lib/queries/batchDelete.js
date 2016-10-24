import configurable from 'configurable.js';

import batchParameter from './batchParameter';
import sanitizeIdentifier from './sanitizeIdentifier';
import combineLiterals from '../utils/combineLiterals';
import whereQuery from './whereQuery';

function batchDelete(ids) {
    const {
        table,
        fields,
        identifier,
    } = this.config;

    const selector = Array.isArray(identifier) ? identifier : [identifier];

    const idSanitizer = sanitizeIdentifier(selector);
    const cleanIds = ids.map(id => idSanitizer(id));

    const parameters = batchParameter(selector)(cleanIds);

    const where = whereQuery(combineLiterals(cleanIds), selector);

    const sql = `DELETE FROM ${table} ${where} RETURNING ${fields.join(', ')};`;

    return {
        sql,
        parameters,
    };
}

export default function (table, fields, identifier) {
    const config = {
        table,
        fields,
        identifier,
    };

    return configurable(batchDelete, config);
}
