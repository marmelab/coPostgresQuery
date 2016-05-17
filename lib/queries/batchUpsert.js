import configurable from '../utils/configurable';
import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

export default function (table, selectorFields, updatableFields, returnFields = '*') {
    let config = {
        table,
        selectorFields,
        updatableFields,
        returnFields,
        fields: selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1))
    };

    function batchUpsert(entities) {
        let {
            table,
            selectorFields,
            updatableFields,
            returnFields,
            fields
        } = config;
        const getValueSubQuery = valueSubQuery(fields);
        const getParameter = batchParameter(fields);

        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const setQuery = updatableFields.map(function (field) {
            return `${field} = excluded.${field}`;
        });

        const values = entities
        .map((_, index) => getValueSubQuery(index))
        .reduce((result, value, index) => result.concat(`(${value})`), []);

        const parameters = getParameter(entities);

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
