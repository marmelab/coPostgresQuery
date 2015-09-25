'use strict';

module.exports = {
    getFieldNames: function (fieldMap) {
        return Object.keys(fieldMap).reduce(function (fields, table) {
            if (table === 'composite') {
                return fields.concat(fieldMap[table].map(function (field) {
                    return field.replace(/^.*AS\s+/, '');
                }));
            }
            return fields.concat(fieldMap[table]);
        }, []);
    },
    getFullFieldNames: function (fieldMap) {
        return Object.keys(fieldMap).reduce(function (fields, table) {
            if (table === 'composite') {
                return fields.concat(fieldMap[table]);
            }
            return fields.concat(fieldMap[table].map(function (field) {
                return table + '.' + field + ' AS ' + field;
            }));
        }, []);
    }
};
