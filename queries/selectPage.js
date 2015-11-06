'use strict';

import whereQuery from './whereQuery';

export default function (tableName, exposedFields, searchableFields = exposedFields, { specificSorts, withQuery = tableName.indexOf('JOIN') !== -1, idFieldName = 'id' } = { withQuery: tableName.indexOf('JOIN') !== -1, idFieldName: 'id' }) {
    var exposedFieldsString = exposedFields.join(', ');

    var baseQuery = `SELECT ${exposedFieldsString}, COUNT(*) OVER() as totalCount FROM ${tableName}`;
    if (withQuery) {// withQuery add a temporary result table that allow to filters on computed and joined field
        baseQuery = `WITH result AS (${baseQuery}) SELECT *, COUNT(*) OVER() as totalCount FROM result`;
    }

    return function selectPage(limit, offset, filters = {}, sort, sortDir) {
        var query = baseQuery;

        let { whereQ, parameters } = whereQuery(filters, searchableFields);
        query += whereQ || '';

        // always sort by id to avoid randomness in case of identical sortField value
        var sortQuery = [`${idFieldName} ASC`];
        if (sort) {
            sort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(sort)) {
                var specificSort = specificSorts[sort].reduce(function (result, condition, index) {
                    return `${result} WHEN '${condition}' THEN ${index + 1}`;
                }, `CASE ${sort}`);
                sortQuery.unshift(`${specificSort} END ${(sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC')}`);
            } else if (exposedFields.indexOf(sort) !== -1) {
                sortQuery.unshift(`${sort} ${(sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC')}`);
            }
        }
        query += ` ORDER BY ${sortQuery.join(', ')}`;

        if (limit) {
            query += ` LIMIT $limit OFFSET $offset`;
            parameters.limit = limit || 30;
            parameters.offset = offset || 0;
        }

        return { query, parameters };
    };
}
