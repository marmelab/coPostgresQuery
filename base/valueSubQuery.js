'use strict';

module.exports = function (writableFields) {
    return function getValueSubQuery(data, suffix = '') {
        var query = [];
        var parameters = {};
        var columns = [];

        writableFields.forEach(function (field) {
            if (typeof data[field] === 'undefined') return;
            columns.push(field);
            query.push(`$${field}${suffix}`);
            parameters[field + suffix] = data[field];
        });

        return {
            query: query.join(', '),
            parameters: parameters,
            columns: columns
        };
    };
};
