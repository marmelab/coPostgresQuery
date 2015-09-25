'use strict';
var batchInsert = require('./batchInsert');

module.exports = function (client, table, fields, idFieldName) {
    var tempTable = 'temp_' + table + '_' + client.id;
    var tempBatchInsert = batchInsert(client, tempTable, fields, idFieldName, false, null, true);

    return function* batchUpdate(entities) {
        yield client.query_('CREATE TEMPORARY TABLE ' + tempTable + ' AS SELECT * FROM ' + table + ' WHERE true = false;'); // copy the table structure without the constraint

        yield tempBatchInsert(entities);

        var setQuery = fields.map(function (field) {
            return field + '=' + tempTable + '.' + field;
        });

        var query = (
            'UPDATE ' + table +
            ' SET ' + setQuery.join(', ') +
            ' FROM ' + tempTable +
            ' WHERE ' + table + '.' + idFieldName + ' = ' + tempTable + '.' + idFieldName +
            ' RETURNING ' + fields.map(f => table + '.' + f).join(', ')
        );

        var error;
        try {
            entities = (yield client.query_(query)).rows;
        } catch (e) {
            error = e;
        }
        yield client.query_('DROP TABLE ' + tempTable);

        if (error) {
            throw error;
        }

        return entities;
    };
};
