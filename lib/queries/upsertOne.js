import valueSubQuery from './helpers/valueSubQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import returningQuery from './helpers/returningQuery';

export default ({
    table,
    primaryKey: idCols = 'id',
    writableCols,
    returnCols,
}) => {
    const returning = returningQuery(returnCols);
    const primaryKey = [].concat(idCols);

    return (row) => {
        const parameters = {
            ...sanitizeIdentifier(primaryKey, row),
            ...sanitizeParameter(writableCols, row),
        };

        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = writableCols
            .filter(column => typeof parameters[column] !== 'undefined')
            .map((column) => `${column} = $${column}`);

        const sql = (
`INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${primaryKey.join(', ')})
${
setQuery.length > 0 ? (
    `DO UPDATE SET ${setQuery.join(', ')}`
) : (
    'DO NOTHING'
)
}
${returning}`
        );

        return { sql, parameters, returnOne: true };
    };
};
