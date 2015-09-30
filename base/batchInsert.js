'use strict';

import batchInsertQuerier from '../queries/batchInsert';

export default function (tableName, insertFields, returnFields = '*') {
    const batchInsertQuery = batchInsertQuerier(tableName, insertFields, returnFields);

    return function (db) {
        return function* batchInsert(entities) {
            if (!entities) {
                throw new Error(`No data for batch inserting ${tableName} entities.`);
            }
            if (entities.length === 0) {
                return [];
            }

            return yield db.query(batchInsertQuery(entities));
        };
    };
};
