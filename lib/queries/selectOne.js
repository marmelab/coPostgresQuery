import whereQuery from './helpers/whereQuery';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';

export default ({ table, primaryKey = 'id', returnFields = ['*'] }) => {
    const select = returnFields.join(', ');
    const identifiers = [].concat(primaryKey);

    return (rawParameters) => {
        const parameters = sanitizeIdentifier(identifiers, rawParameters);
        const where = whereQuery(parameters, identifiers);

        const sql = `SELECT ${select} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters, returnOne: true };
    };
};
