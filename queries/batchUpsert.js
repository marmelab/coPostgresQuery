import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';

export default function (table, selectorFields, updatableFields, returnFields = '*') {
    let config = {
        table,
        fields: selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1)),
        selectorFields,
        updatableFields,
        returnFields
    };

    function batchUpsert(entities) {
        let {
            table,
            fields,
            selectorFields,
            updatableFields,
            returnFields
        } = config;
        const getValueSubQuery = valueSubQuery(fields);

        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const setQuery = updatableFields.map(function (field) {
            return `${field} = excluded.${field}`;
        });

        const { values, parameters } = entities
        .map((entity, index) => getValueSubQuery(entity, index + 1))
        .reduce((result, value, index) => ({
            parameters: {...result.parameters, ...value.parameters},
            values: result.values.concat(`(${value.sql})`)
        }), { values: [], parameters: {} });

        const sql = (
`INSERT INTO ${table}
(${fields.join(', ')})
VALUES ${values.join(', ')}
ON CONFLICT (${selectorFields.join(', ')})
DO UPDATE SET ${setQuery.join(', ')}
RETURNING ${returnFields}`
        );

        return { sql, parameters };
    };

    return configurable(batchUpsert, config);
};
