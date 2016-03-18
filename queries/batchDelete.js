import batchParameter from './batchParameter';
import configurable from '../utils/configurable';

module.exports = function (table, fields, identifier) {
    let config = {
        table,
        fields,
        identifier
    };

    const batchDelete = function batchDelete(ids) {
        const {
            table,
            fields,
            identifier
        } = config;

        const parameters = batchParameter([identifier])(ids.map((id) => ({[identifier]: id})));

        const idsQuery = ids.reduce((sql, id, index) => ([
            ...sql,
            `$${identifier}${index}`
        ]), []);

        const sql = `DELETE FROM ${table} WHERE ${identifier} IN (${idsQuery.join(', ')}) RETURNING ${fields.join(', ')}`;

        return {
            sql,
            parameters
        };
    };

    return configurable(batchDelete, config);
};
