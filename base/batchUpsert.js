'use strict';
var batchInsert = require('./batchInsert');

module.exports = function (client, table, primaryFields, secondaryFields, autoIncrementField) {
    var fields = primaryFields.concat(secondaryFields);
    var tempTable = 'temp_' + table + '_' + client.id;
    var tempBatchInsert = batchInsert(client, tempTable, fields, null, true, null, true);
    var insertFields = fields.filter(f => f !== autoIncrementField);

    return function* batchUpsert(entities) {
        try {
            yield client.query('CREATE TEMPORARY TABLE ' + tempTable + ' AS SELECT * FROM ' + table + ' WHERE true = false;'); // copy the table structure without the constraint
            yield tempBatchInsert(entities);

            var setQuery = secondaryFields.map(function (field) {
                return field + '=' + tempTable + '.' + field;
            });

            var whereUpdateQuery = primaryFields
            .map(field => table + '.' + field + '=' + tempTable + '.' + field)
            .join(' AND ');

            var whereInsertQuery = primaryFields
            .map(field => 'upd.' + field + '=' + tempTable + '.' + field)
            .join(' AND ');

            var query = (
'WITH upd AS (' +
    'UPDATE ' + table + ' ' +
        'SET ' + setQuery.join(',') + ' ' +
    'FROM ' + tempTable + ' ' +
    'WHERE ' + whereUpdateQuery + ' ' +
    'RETURNING ' + table + '.*' +
')' +
'INSERT INTO ' + table + '(' + insertFields.join(', ') + ')' +
    'SELECT ' + (insertFields.join(', ')) + ' ' +
    'FROM ' + tempTable + ' ' +
    'WHERE NOT EXISTS (' +
        'SELECT 1 FROM upd ' +
        'WHERE ' + whereInsertQuery +
    ');'
);
            var error;
            yield client.query(query);
        } catch (e) {
            error = e;
        }

        yield client.query('DROP TABLE ' + tempTable);

        if (error) {
            throw error;
        }
    };
};
