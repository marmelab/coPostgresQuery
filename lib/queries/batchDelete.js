import batchParameter from './batchParameter';
import sanitizeIdentifier from './sanitizeIdentifier';
import combineLiterals from '../utils/combineLiterals';
import whereQuery from './whereQuery';

export default ({ table, fields, idFields }) => (ids) => {
    const selector = [].concat(idFields);

    const idSanitizer = sanitizeIdentifier(selector);
    const cleanIds = ids.map(id => idSanitizer(id));

    const parameters = batchParameter(selector)(cleanIds);

    const where = whereQuery(combineLiterals(cleanIds), selector);

    const sql = `DELETE FROM ${table} ${where} RETURNING ${fields.join(', ')};`;

    return {
        sql,
        parameters,
    };
};
