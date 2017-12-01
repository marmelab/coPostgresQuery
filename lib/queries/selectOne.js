import whereQuery from './helpers/whereQuery';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';

export default ({ table, primaryKey = 'id', returnCols = ['*'], permanentFilters = {} }) => {
    const select = returnCols.join(', ');
    const identifiers = [
        ...[].concat(primaryKey),
        ...Object.keys(permanentFilters),
    ];

    return (rawParameters) => {
        const parameters = sanitizeIdentifier(identifiers, {
            ...typeof rawParameters === 'object' ? rawParameters : { [primaryKey]: rawParameters },
            ...permanentFilters,
        });
        const where = whereQuery(parameters, identifiers);

        const sql = `SELECT ${select} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters, returnOne: true };
    };
};
