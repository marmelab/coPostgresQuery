import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';
import returningQuery from './returningQuery';

export default ({
    table,
    idFields = ['id'],
    updatableFields,
    fields = idFields.concat(updatableFields.filter((f) => idFields.indexOf(f) === -1)),
    returnFields,
}) => {
    const returning = returningQuery(returnFields);

    return (entity) => {
        const parameters = sanitizeParameter(fields, entity);
        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = keys.filter(key => updatableFields.indexOf(key) !== -1).map((field) => `${field} = $${field}`);

        const sql = (
`INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${idFields.join(', ')})
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
