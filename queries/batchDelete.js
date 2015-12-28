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

        const idsQuery = ids.reduce(({ parameters, sql }, id, index) => ({
            parameters: {
                ...parameters,
                [idFieldName]: id
            },
            sql: [
                ...sql,
                `$${idFieldName}${index}`
            ]
        }), {
            parameters: {},
            sql: []
        });

        const sql = `DELETE FROM ${table} WHERE ${idFieldName} IN (${idsQuery.sql.join(', ')}) RETURNING ${fields.join(', ')}`;

        return {
            sql,
            parameters: idsQuery.parameters
        };
    };

    return configurable(batchDelete, config);
};
