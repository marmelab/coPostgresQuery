import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

export default ({
    table,
    selectorFields,
    updatableFields,
    fields = selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1)),
    returnFields = ['*'],
}) => (entities) => {
    const getValueSubQuery = valueSubQuery(fields);
    const getParameter = batchParameter(fields);

    const returning = returnFields.join(', ');

    const setQuery = updatableFields.map((field) => `${field} = excluded.${field}`);

    const values = entities
        .map((_, index) => getValueSubQuery(index + 1))
        .reduce((result, value) => result.concat(`(${value})`), []);

    const parameters = getParameter(entities);

    const sql = (
`INSERT INTO ${table}
(${fields.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${selectorFields.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returning}`
    );

    return { sql, parameters };
};
