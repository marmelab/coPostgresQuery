import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';
import sanitizeParameter from './sanitizeParameter';

export default function (table, selectorFields, updatableFields, returnFields = ['*']) {
    let fields = selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1));
    let config = {
        table,
        selectorFields,
        updatableFields,
        returnFields,
        fields
    };

    function upsertOne(entity) {
        const {
            table,
            fields,
            selectorFields,
            updatableFields,
            returnFields
        } = config;
        const setQuery = updatableFields.map(function (field) {
            return `${field} = $${field}`;
        });

        const parameters = sanitizeParameter(fields, entity);
        const keys = Object.keys(parameters);
        const values = valueSubQuery(keys, '');

        const sql = (
`INSERT INTO ${table} (${keys.join(', ')})
VALUES (${values})
ON CONFLICT (${selectorFields.join(', ')}) DO UPDATE
SET ${setQuery.join(', ')}
RETURNING ${returnFields.join(', ')}`
        );

        return { sql, parameters };
    };

    return configurable(upsertOne, config);
};
