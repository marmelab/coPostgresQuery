import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import whereQuery from './helpers/whereQuery';

export default ({ table, permanentFilters = {} }) => () => {
    const identifiers = Object.keys(permanentFilters);
    if (!identifiers.length) {
        const sql = `SELECT COUNT(*) FROM ${table};`;

        return { sql, returnOne: true };
    }

    const parameters = sanitizeIdentifier(identifiers, permanentFilters);
    const where = whereQuery(parameters, identifiers);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters, returnOne: true };
};
