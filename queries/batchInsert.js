'use strict';

import merge from '../utils/merge';
import valueSubQuery from '../base/valueSubQuery';

export default function (tableName, insertFields, returnFields = '*') {
    var getValueSubQuery = valueSubQuery(insertFields);

    return function batchInsert(entities) {

        if (Array.isArray(returnFields)) {
            returnFields = returnFields.join(', ');
        }

        const { values, parameters } = entities
        .map((entity, index) => getValueSubQuery(entity, index + 1))
        .reduce((result, value, index) => ({
            parameters: merge(result.parameters, value.parameters),
            values: result.values.concat(`(${value.sql})`)
        }), { values: [], parameters: {} });

        const sql = `INSERT INTO ${tableName}(${insertFields.join(', ')}) VALUES ${values.join(', ')} RETURNING ${returnFields}`;

        return { sql, parameters };
    };
};
