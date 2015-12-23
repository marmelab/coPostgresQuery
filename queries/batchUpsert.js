import valueSubQuery from './valueSubQuery';

export default function (tableName, primaryFields, secondaryFields, returnFields = '*') {
    const fields = primaryFields.concat(secondaryFields.filter((f) => primaryFields.indexOf(f) === -1));
    var getValueSubQuery = valueSubQuery(fields);

    return function batchUpsert(entities) {
        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const setQuery = secondaryFields.map(function (field) {
            return `${field} = excluded.${field}`;
        });

        const { values, parameters } = entities
        .map((entity, index) => getValueSubQuery(entity, index + 1))
        .reduce((result, value, index) => ({
            parameters: {...result.parameters, ...value.parameters},
            values: result.values.concat(`(${value.sql})`)
        }), { values: [], parameters: {} });

        const sql = (
`INSERT INTO ${tableName}
(${fields.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${primaryFields.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returnFields}`
        );

        return { sql, parameters };
    };
};
