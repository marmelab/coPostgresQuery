'use strict';

module.exports = function (table, fields, idFieldName) {
    return function batchDelete(ids) {
        const idsQuery = ids.reduce(function (query, id, index) {
            const fieldName = idFieldName + index;
            query.parameters[fieldName] = id;
            query.sql.push(`$${fieldName}`);

            return query;
        }, {
            parameters: {},
            sql: []
        });

        const sql = `DELETE FROM ${table} WHERE ${idFieldName} IN (${idsQuery.sql.join(', ')}) RETURNING ${fields.join(', ')}`;

        return {
            sql,
            parameters: idsQuery.parameters
        };
    };
};
