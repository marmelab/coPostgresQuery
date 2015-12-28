import configurable from '../configurable';

export default function (table, fields, identifiers, returningFields = fields) {
    let config = {
        table,
        fields,
        identifiers,
        returningFields
    };

    function batchUpdate(fromTable) {
        const {
            table,
            fields,
            identifiers,
            returningFields
        } = config;
        const setQuery = fields.map((field) => `${field} = ${fromTable}.${field}`);

        const whereQuery = identifiers.map((field) => `${table}.${field} = ${fromTable}.${field}`);

        const sql = (
`UPDATE ${table}
SET ${setQuery.join(', ')}
FROM ${fromTable}
WHERE ${whereQuery.join(', ')}
RETURNING ${returningFields.map(field => `${table}.${field}`).join(', ')}`
        );

        return { sql };
    };

    return configurable(batchUpdate, config);
};
