export default function (table, primaryFields, secondaryFields, autoIncrementFields = [], returningFields = secondaryFields) {
    const fields = primaryFields.concat(secondaryFields.filter((f) => primaryFields.indexOf(f) === -1));
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

        const sql = (
`INSERT INTO ${table} (${insertFields.join(', ')})
VALUES (${valuesQuery.join(', ')})
ON CONFLICT (${primaryFields.join(', ')}) DO UPDATE
SET ${setQuery.join(', ')}`
        );

        return { sql, parameters };
    };
};
