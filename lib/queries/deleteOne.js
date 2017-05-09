import sanitizeIdentifier from './sanitizeIdentifier';
import whereQuery from './whereQuery';
import returningQuery from './returningQuery';

export default ({ table, idFields, returnFields }) => {
    const returning = returningQuery(returnFields);
    return (id) => {
        const parameters = sanitizeIdentifier(idFields, id);
        const where = whereQuery(parameters, idFields);
        const sql = `DELETE FROM ${table} ${where} ${returning}`;

        return { sql, parameters, returnOne: true };
    };
};
