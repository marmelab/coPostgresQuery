import valueSubQuery from './helpers/valueSubQuery';
import sanitizeParameter from './helpers/sanitizeParameter';
import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import returningQuery from './helpers/returningQuery';

export default ({
    table,
    primaryKey: idFields = 'id',
    writableFields,
    returnFields,
}) => {
    const returning = returningQuery(returnFields);
    const primaryKey = [].concat(idFields);

    return (row) => {
        const parameters = {
            ...sanitizeIdentifier(primaryKey, row),
            ...sanitizeParameter(writableFields, row),
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
