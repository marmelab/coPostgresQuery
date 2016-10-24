import configurable from 'configurable.js';
import valueSubQuery from './valueSubQuery';
import batchParameter from './batchParameter';

function batchUpsert(entities) {
    const {
        table,
        selectorFields,
        updatableFields,
        fields,
    } = this.config;
    let { returnFields } = this.config;
    const getValueSubQuery = valueSubQuery(fields);
    const getParameter = batchParameter(fields);

    if (Array.isArray(returnFields)) {
        returnFields = returnFields.join(', ');
    }

    const setQuery = updatableFields.map((field) => `${field} = excluded.${field}`);

    const values = entities
    .map((_, index) => getValueSubQuery(index + 1))
    .reduce((result, value) => result.concat(`(${value})`), []);

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
}

export default function (table, selectorFields, updatableFields, returnFields = '*') {
    const config = {
        table,
        selectorFields,
        updatableFields,
        returnFields,
        fields: selectorFields.concat(updatableFields.filter((f) => selectorFields.indexOf(f) === -1)),
    };

    return configurable(batchUpsert, config);
}
