import valueSubQuery from './helpers/valueSubQuery';
import batchParameter from './helpers/batchParameter';

export default ({
    table,
    primaryKey,
    writableCols,
    returnCols = ['*'],
}) => (rows) => {
    const columns = primaryKey.concat(writableCols.filter((f) => primaryKey.indexOf(f) === -1));
    const getValueSubQuery = valueSubQuery(columns);
    const getParameter = batchParameter(columns);

    const returning = returnCols.join(', ');

    const setQuery = writableCols.map((col) => `${col} = excluded.${col}`);

    const values = rows
        .map((_, index) => getValueSubQuery(index + 1))
        .reduce((result, value) => result.concat(`(${value})`), []);

    const parameters = getParameter(rows);

    const sql = (
`INSERT INTO ${table}
(${columns.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${primaryKey.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returning}`
    );

    return { sql, parameters };
};
