'use strict';

import merge from '../utils/merge';

module.exports = function (writableFields) {
    return function getValueSubQuery(data, suffix = '') {

        let valueSubQuery = writableFields
        // .filter(field => typeof data[field] !== 'undefined')
        .map((field) => ({
            column: field,
            sql: `$${field}${suffix}`,
            parameter: {
                [`${field}${suffix}`]: data[field] || 'NULL'
            }
        }));
        const columns = valueSubQuery.map(v => v.column);
        const sql = valueSubQuery.map(v => v.sql).join(', ');
        const parameters = valueSubQuery.map(v => v.parameter)
        .reduce((result, v) => merge(v, result), {});

        return { columns, sql, parameters };
    };
};
