'use strict';

import selectPageQueryFactory from '../queries/selectPage';

export default function (tableName, exposedFields, searchableFields, options) {
    const selectPageQuery = selectPageQueryFactory(tableName, exposedFields, searchableFields, options);

    return function (client) {
        return function* selectPage(limit, offset, match, sort, sortDir, other) {

            return yield client.query(selectPageQuery(limit, offset, match, sort, sortDir, other));
        };

    };
}
