import sanitizeIdentifier from './sanitizeIdentifier';
import whereQuery from './whereQuery';

export default ({ table, idFields, returnFields = ['*'] }) => (id) => {
    const parameters = sanitizeIdentifier(idFields, id);
    const where = whereQuery(parameters, idFields);
    const sql = `DELETE FROM ${table} ${where} RETURNING ${returnFields.join(', ')}`;

    return { sql, parameters, returnOne: true };
};
