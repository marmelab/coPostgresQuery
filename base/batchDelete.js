'use strict';

module.exports = function (client, table, fields, idFieldName) {

    return function* batchInsert(ids) {
        var idsQuery = ids.reduce(function (query, id, index) {
            var fieldName = idFieldName + index;
            query.parameters[fieldName] = id;
            query.sql.push('$' + fieldName);

            return query;
        }, {
            parameters: {},
            sql: []
        });
        var query = 'DELETE FROM ' + table + ' WHERE ' + idFieldName + ' IN (' + idsQuery.sql.join(', ') + ') RETURNING ' + fields.join(', ');

        return (yield client.query_(query, idsQuery.parameters)).rows;
    };
};
