import whereQuery from './helpers/whereQuery';

export default ({ table, permanentFilters = {} }) => ({ filters } = {}) => {
    const mergedFilters = {
        ...permanentFilters,
        ...filters,
    };

    const identifiers = Object.keys(mergedFilters);
    if (!identifiers.length) {
        const sql = `SELECT COUNT(*) FROM ${table};`;

        return { sql, returnOne: true };
    }

    const where = whereQuery(mergedFilters, identifiers);
    const sql = `SELECT COUNT(*) FROM ${table} ${where};`;

    return { sql, parameters: mergedFilters, returnOne: true };
};
