
import batchParameter from './batchParameter';
import configurable from '../utils/configurable';

module.exports = function (table, fields, idFieldName) {
    let config = {
        table,
        fields,
        idFieldName
    };

    const batchDelete = function batchDelete(ids) {
        const {
            table,
            fields,
            idFieldName
        } = config;

        const parameters = batchParameter([idFieldName], ids.map((id) => ({[idFieldName]: id})));

        const idsQuery = ids.reduce((sql, id, index) => ([
            ...sql,
            `$${idFieldName}${index}`
        ]), []);

        const sql = `DELETE FROM ${table} WHERE ${idFieldName} IN (${idsQuery.join(', ')}) RETURNING ${fields.join(', ')}`;

        return {
            sql,
            parameters
        };
    };

    return configurable(batchDelete, config);
};
