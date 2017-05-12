import flatten from '../utils/flatten';
import sanitizeParameter from './helpers/sanitizeParameter';

export default ({ table, filterCol, returnCols = ['*'] }) => (values) => {
    if (!Array.isArray(values)) {
        throw new Error('selectByOrderedColValues values parameter should be an array');
    }

    const sql = (
`SELECT ${returnCols.map(column => `${table}.${column}`).join(', ')}
FROM ${table}
JOIN (
VALUES ${values.map((value, index) => `($${filterCol}${index + 1}, ${index + 1})`).join(', ')}
) AS x (${filterCol}, ordering)
ON ${table}.${filterCol}::varchar=x.${filterCol}
ORDER BY x.ordering;`
    );

    const parameters = flatten(sanitizeParameter([filterCol], { [filterCol]: values }));

    return { sql, parameters };
};
