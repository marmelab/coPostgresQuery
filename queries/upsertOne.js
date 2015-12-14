import whereQuerier from './whereQuery';

export default function (table, primaryFields, secondaryFields, autoIncrementFields = [], returningFields = secondaryFields) {
    const fields = primaryFields.concat(secondaryFields);
    const insertFields = fields.filter(f => autoIncrementFields.indexOf(f) === -1);

    return function upsertOne(entity) {
        const setQuery = secondaryFields.map(function (field) {
            return `${field} = $${field}`;
        });

        const parameters = fields
        .reduce((result, field) => ({ ...result, [field]: entity[field]}), {});

        const valuesQuery = Object.keys(entity)
        .filter(key => insertFields.indexOf(key) !== -1)
        .map(field => `$${field}`);

        const whereQuery = whereQuerier(entity, primaryFields);

        const sql = (
`WITH upsert AS (
    UPDATE ${table}
    SET ${setQuery.join(', ')}
    ${whereQuery.query}
    RETURNING ${table}.*
)
INSERT INTO ${table} (${insertFields.join(', ')})
SELECT ${valuesQuery.join(', ')}
WHERE NOT EXISTS (
    SELECT * FROM upsert
)`
        );

        return { sql, parameters };
    };
};
