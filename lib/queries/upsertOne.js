import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';
import sanitizeIdentifier from './sanitizeIdentifier';
import returningQuery from './returningQuery';

export default ({
    table,
    primaryKey: idFields = 'id',
    writableFields,
    returnFields,
}) => {
    const returning = returningQuery(returnFields);
    const primaryKey = [].concat(idFields);

    return (entity) => {
        const parameters = {
            ...sanitizeIdentifier(primaryKey, entity),
            ...sanitizeParameter(writableFields, entity),
        };

        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = writableFields
            .filter(field => typeof parameters[field] !== 'undefined')
            .map((field) => `${field} = $${field}`);

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
