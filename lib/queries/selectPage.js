import configurable from '../utils/configurable';
import whereQuery from './whereQuery';
import sanitizeParameter from './sanitizeParameter';
import flattenParameters from './flattenParameters';

export default function (table, idFields, returnFields) {

    let config = {
        table,
        idFields: [].concat(idFields),
        returnFields,
        searchableFields: returnFields,
        specificSorts: {},
        withQuery: table.indexOf('JOIN') !== -1
    };

    const selectPage = function selectPage(limit, offset, filters = {}, sort, sortDir) {
        const {
            table,
            returnFields,
            idFields,
            searchableFields,
            specificSorts,
            withQuery
        } = config;
        const where = whereQuery(filters, searchableFields);
        let sql = `SELECT ${returnFields.join(', ')}, COUNT(*) OVER() as totalCount FROM ${table} ${where}`;
        if (withQuery) {// withQuery add a temporary result table that allow to filters on computed and joined field
            sql = `WITH result AS (${sql}) SELECT * FROM result`;
        }

        const parameters = flattenParameters(sanitizeParameter(returnFields, filters));

        // always sort by ids to avoid randomness in case of identical sortField value
        let sortQuery = [idFields.map(idField => `${idField} ASC`).join(', ')];
        if (sort) {
            sort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(sort)) {
                const specificSort = specificSorts[sort].reduce(function (result, condition, index) {
                    return `${result} WHEN '${condition}' THEN ${index + 1}`;
                }, `CASE ${sort}`);
                sortQuery.unshift(`${specificSort} END ${(sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC')}`);
            } else if (returnFields.indexOf(sort) !== -1) {
                sortQuery.unshift(`${sort} ${(sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC')}`);
            }
        }
        sql += ` ORDER BY ${sortQuery.join(', ')}`;

        if (limit) {
            sql += ` LIMIT $limit OFFSET $offset`;
            parameters.limit = limit || 30;
            parameters.offset = offset || 0;
        }

        return { sql, parameters };
    };

    return configurable(selectPage, config);
}
