import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, selectorFields, updatableFields, returnFields = ['*']) {
    const fields = selectorFields
    .concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1));
    const config = {
        table,
        selectorFields,
        updatableFields,
        returnFields,
        fields,
    };

    function upsertOne(entity) {
        const {
            table,
            fields,
            selectorFields,
            updatableFields,
            returnFields,
        } = config;

        const parameters = sanitizeParameter(fields, entity);
        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const setQuery = keys.filter(key => updatableFields.indexOf(key) !== -1).map((field) => `${field} = $${field}`);

        const sql = (
`INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${selectorFields.join(', ')})
${
    setQuery.length > 0 ? (
        `DO UPDATE SET ${setQuery.join(', ')}`
    ) : (
        `DO NOTHING`
    )
}
RETURNING ${returnFields.join(', ')}`
        );

        return { sql, parameters };
    };

    return configurable(upsertOne, config);
};
