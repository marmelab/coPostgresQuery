'use strict';

import batchInsert from './batchInsert';
import batchUpdateQuerier from '../queries/batchUpdate';

export default function (table, fields, identifiers, returningFields = fields) {
    const batchUpdateQuery = batchUpdateQuerier(table, fields, identifiers, returningFields);

    return function (client) {
        const tempTable = `temp_${table}_${client.id}`;
        const tempBatchInsert = batchInsert(tempTable, fields)(client);
        return function* batchUpdate(entities) {
            yield client.begin();
            // copy the table structure without the constraint
            yield client.query({ sql: `CREATE TEMPORARY TABLE ${tempTable} ON COMMIT DROP AS SELECT * FROM ${table} WHERE true = false;` });

            yield tempBatchInsert(entities);

            try {
                entities = yield client.query(batchUpdateQuery(tempTable));
            } catch (error) {
                yield client.rollback();
                throw error;
            }

            yield client.commit();

            return entities;
        };
    };
};
