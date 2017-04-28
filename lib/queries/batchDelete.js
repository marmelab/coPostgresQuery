import configurable from 'configurable.js';

import batchParameter from './batchParameter';
import sanitizeIdentifier from './sanitizeIdentifier';
import combineLiterals from '../utils/combineLiterals';
import whereQuery from './whereQuery';

function batchDelete(ids) {
    const {
        table,
        fields,
        idFields,
    } = this.config;

    const selector = Array.isArray(idFields) ? idFields : [idFields];

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

export default ({ table, fields, idFields }) =>
    configurable(batchDelete, { table, fields, idFields });
