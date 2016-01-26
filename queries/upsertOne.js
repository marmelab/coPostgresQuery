import configurable from '../utils/configurable';
import sanitizeParameter from './sanitizeParameter';

export default function (table, selectorFields, updatableFields, autoIncrementFields = [], returningFields = ['*']) {
    let fields = selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1));
    let config = {
        table,
        fields,
        insertFields: fields.filter(f => autoIncrementFields.indexOf(f) === -1),
        selectorFields,
        updatableFields,
        autoIncrementFields,
        returningFields
    };

    function upsertOne(entity) {
        const {
            table,
            fields,
            insertFields,
            selectorFields,
            updatableFields,
            autoIncrementFields,
            returningFields
        } = config;
        const setQuery = updatableFields.map(function (field) {
            return `${field} = $${field}`;
        });

        const parameters = sanitizeParameter(fields, entity);

        const valuesQuery = Object.keys(entity)
        .filter(key => insertFields.indexOf(key) !== -1)
        .map(field => `$${field}`)
        .join(', ');

        const sql = (
`INSERT INTO ${table} (${insertFields.join(', ')})
VALUES (${valuesQuery})
ON CONFLICT (${selectorFields.join(', ')}) DO UPDATE
SET ${setQuery.join(', ')}
RETURNING ${returningFields.join(', ')}`
        );

        return { sql, parameters };
    };

    return configurable(upsertOne, config);
};
