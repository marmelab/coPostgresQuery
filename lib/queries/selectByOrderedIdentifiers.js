import flatten from '../utils/flatten';
import sanitizeParameter from './helpers/sanitizeParameter';

export default ({ table, primaryKey, returnCols = ['*'] }) => (values) => {
    if (!Array.isArray(values)) {
        throw new Error('selectByOrderedIdentifiers values parameter should be an array');
    }

    const sql = (
`SELECT ${returnCols.map(column => `${table}.${column}`).join(', ')}
FROM ${table}
JOIN (
VALUES ${values.map((value, index) => `($${primaryKey}${index + 1}, ${index + 1})`).join(', ')}
) AS x (${primaryKey}, ordering)
ON ${table}.${primaryKey}::varchar=x.${primaryKey}
ORDER BY x.ordering;`
    );

    const parameters = flatten(sanitizeParameter([primaryKey], { [primaryKey]: values }));

    return { sql, parameters };
};
