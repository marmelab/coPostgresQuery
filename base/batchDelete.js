'use strict';

import batchDeleteQueryFactory from '../queries/batchDelete';

module.exports = function (table, fields, idFieldName) {
    const batchDeleteQuery = batchDeleteQueryFactory(table, fields, idFieldName);

    return function (db) {
        return function* batchInsert(ids) {

            return yield db.query(batchDeleteQuery(ids));
        };
    };

};
