import configurable from 'configurable.js';
import batchInsert from './batchInsert';

export default function (initialTable, initialTemporaryTable, initialFields, initialIdentifiers, initialReturnFields = initialFields) {
    const config = {
        table: initialTable,
        fields: initialFields,
        identifiers: initialIdentifiers,
        returnFields: initialReturnFields,
        temporaryTable: initialTemporaryTable,
    };


    function batchUpdate(entities) {
        const {
            table,
            fields,
            identifiers,
            returnFields,
            temporaryTable,
        } = config;
        const tempBatchInsert = batchInsert(temporaryTable, fields);
        const setQuery = fields.map((field) => `${field} = ${temporaryTable}.${field}`);

        const whereQuery = identifiers.map((field) => `${table}.${field} = ${temporaryTable}.${field}`);

        const sql = (
`CREATE TEMPORARY TABLE ${temporaryTable} ON COMMIT DROP AS SELECT * FROM ${table} WHERE true = false;
${tempBatchInsert(entities).sql}
UPDATE ${table}
SET ${setQuery.join(', ')}
FROM ${temporaryTable}
WHERE ${whereQuery.join(', ')}
RETURNING ${[].concat(returnFields).map(field => `${table}.${field}`).join(', ')}`
        );

        return { sql, parameters: tempBatchInsert(entities).parameters };
    }

    return configurable(batchUpdate, config);
}
