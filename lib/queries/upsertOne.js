import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

function upsertOne(entity) {
    const {
        table,
        fields,
        idFields,
        updatableFields,
        returnFields,
    } = this.config;

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
RETURNING ${returnFields.join(', ')}`
    );

    return { sql, parameters };
}

export default ({
    table,
    idFields,
    updatableFields,
    fields = idFields.concat(updatableFields.filter((f) => idFields.indexOf(f) === -1)), returnFields = ['*'] },
) =>
    configurable(upsertOne, {
        table,
        idFields,
        updatableFields,
        returnFields,
        fields,
    });
