'use strict';

var batchInsert = require('./batchInsert');

module.exports = function (table, fields, idFieldName) {

    return function (client) {
        const tempTable = `temp_${table}_${client.id}`;
        const tempBatchInsert = batchInsert(tempTable, fields)(client);
        return function* batchUpdate(entities) {
            yield client.query({ sql: `CREATE TEMPORARY TABLE ${tempTable} AS SELECT * FROM ${table} WHERE true = false;` }); // copy the table structure without the constraint

            yield tempBatchInsert(entities);

            const setQuery = fields.map(function (field) {
                return `${field} = ${tempTable}.${field}`;
            });

            const sql = `UPDATE ${table}
                SET ${setQuery.join(', ')}
                FROM ${tempTable}
                WHERE ${table}.${idFieldName} = ${tempTable}.${idFieldName}
                RETURNING ${fields.map(f => `${table}.${f}`).join(', ')}`;

            var error;
            try {
                entities = yield client.query({ sql });
            } catch (e) {
                error = e;
            }
            yield client.query({ sql: `DROP TABLE ${tempTable}` });

            if (error) {
                throw error;
            }

            return entities;
        };
    };
};
