import valueSubQuery from './helpers/valueSubQuery';
import batchParameter from './helpers/batchParameter';

export default ({
    table,
    primaryKey,
    writableFields,
    returnFields = ['*'],
}) => (entities) => {
    const fields = primaryKey.concat(writableFields.filter((f) => primaryKey.indexOf(f) === -1));
    const getValueSubQuery = valueSubQuery(fields);
    const getParameter = batchParameter(fields);

    const returning = returnFields.join(', ');

    const setQuery = writableFields.map((field) => `${field} = excluded.${field}`);

    const values = entities
        .map((_, index) => getValueSubQuery(index + 1))
        .reduce((result, value) => result.concat(`(${value})`), []);

    const parameters = getParameter(entities);

    const sql = (
`INSERT INTO ${table}
(${fields.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${primaryKey.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returning}`
    );

    return { sql, parameters };
};
