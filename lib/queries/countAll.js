import whereQuery from './helpers/whereQuery';

export default ({ table, permanentFilters = {} }) => () => {
    const identifiers = Object.keys(permanentFilters);
    if (!identifiers.length) {
        const sql = `SELECT COUNT(*) FROM ${table};`;

        return { sql, returnOne: true };
    }

    const where = whereQuery(permanentFilters, identifiers);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters: permanentFilters, returnOne: true };
};
