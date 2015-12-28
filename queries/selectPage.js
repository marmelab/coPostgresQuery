import configurable from '../utils/configurable';
import whereQuery from './whereQuery';

export default function (table, identifiers = ['id'], fields) {

    let config = {
        table,
        fields,
        searchableFields: fields,
        identifiers,
        specificSorts: {},
        withQuery: table.indexOf('JOIN') !== -1
    };

    const selectPage = function selectPage(limit, offset, filters = {}, sort, sortDir) {
        const {
            table,
            fields,
            searchableFields,
            identifiers,
            specificSorts,
            withQuery
        } = config;
        let query = `SELECT ${fields.join(', ')}, COUNT(*) OVER() as totalCount FROM ${table}`;
        if (withQuery) {// withQuery add a temporary result table that allow to filters on computed and joined field
            query = `WITH result AS (${query}) SELECT *, COUNT(*) OVER() as totalCount FROM result`;
        }

        let { sql, parameters } = whereQuery(filters, searchableFields);
        query += sql || '';

        // always sort by id to avoid randomness in case of identical sortField value
        let sortQuery = [`${identifiers} ASC`];
        if (sort) {
            sort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(sort)) {
                const specificSort = specificSorts[sort].reduce(function (result, condition, index) {
                    return `${result} WHEN '${condition}' THEN ${index + 1}`;
                }, `CASE ${sort}`);
                sortQuery.unshift(`${specificSort} END ${(sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC')}`);
            } else if (fields.indexOf(sort) !== -1) {
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

    return configurable(selectPage, config);
}
