'use strict';

import valueSubQuery from './valueSubQuery';

export default function (tableName, insertFields, returningFields = ['*']) {
    const getValueSubQuery = valueSubQuery(insertFields);

    return function insertOne(data) {
        const values = getValueSubQuery(data);
        const sql = `INSERT INTO ${tableName} (${values.columns.join(', ')}) VALUES(${values.sql}) RETURNING ${returningFields.join(', ')}`;

        return {
            sql,
            parameters: values.parameters
        };
    };
};
