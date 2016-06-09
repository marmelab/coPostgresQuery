import configurable from 'configurable.js';
import sanitizeParameter from './sanitizeParameter';
import flattenParameters from './flattenParameters';

export default function (table, selectorField, returnFields) {

    let config = {
        table,
        selectorField,
        returnFields
    };

    const selectBy = function selectBy(values) {
        if (!Array.isArray(values)) {
            throw new Error('selectBy values parameter should be an array');
        }

        const {
            table,
            selectorField,
            returnFields
        } = config;

        const sql = (
`SELECT ${returnFields.map(field => `${table}.${field}`).join(', ')}
FROM ${table}
JOIN (
VALUES ${values.map((value, index) => `($${selectorField}${index + 1}, ${index + 1})`).join(', ')}
) AS x (${selectorField}, ordering)
ON ${table}.${selectorField}::varchar=x.${selectorField}
ORDER BY x.ordering;`
        );

        const parameters = flattenParameters(sanitizeParameter([selectorField], { [selectorField]: values }));

        return { sql, parameters };
    };

    return configurable(selectBy, config);
}
