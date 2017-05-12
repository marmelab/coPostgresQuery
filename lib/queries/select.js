import flatten from '../utils/flatten';
import whereQuery from './helpers/whereQuery';
import sanitizeParameter from './helpers/sanitizeParameter';

export default ({
    table,
    primaryKey: ids = 'id',
    returnFields,
    searchableFields = returnFields || [],
    specificSorts = {},
    groupByFields = [],
    withQuery = table.indexOf('JOIN') !== -1,
}) => {
    const primaryKey = [].concat(ids);
    const select = returnFields.length ? returnFields.join(', ') : '*';

    return ({ limit, offset, filters = {}, sort, sortDir } = { filters: {} }) => {
        const where = whereQuery(filters, searchableFields);
        let sql = `SELECT ${select} FROM ${table} ${where}`;

        if (groupByFields.length > 0) {
            sql = `${sql} GROUP BY ${groupByFields.join(', ')}`;
        }
        // withQuery add a temporary result table that allows to filters on computed and joined field
        if (withQuery) {
            sql = (
`WITH result AS (
${sql.trim()}
) SELECT * FROM result`
            );
        }

        const parameters = flatten(sanitizeParameter(searchableFields, filters));

        // always sort by ids to avoid randomness in case of identical sortField value
        const sortQuery = [primaryKey.map(idField => `${idField} ASC`).join(', ')];
        if (sort) {
            const normalizedSort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(normalizedSort)) {
                const specificSort = specificSorts[normalizedSort]
                .reduce(
                    (result, condition, index) =>
                        `${result} WHEN '${condition}' THEN ${index + 1}`, 'CASE $sort'
                );
                sortQuery.unshift(
                    `${specificSort} END ${(sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC')}`
                );
            } else if (returnFields.indexOf(normalizedSort) !== -1) {
                sortQuery.unshift(
                    `$sort ${(sortDir.toLowerCase() === 'asc' ? 'ASC' : 'DESC')}`
                );
            }
            parameters.sort = normalizedSort;
        }
        sql = `${sql} ORDER BY ${sortQuery.join(', ')}`;

        if (limit) {
            sql = `${sql} LIMIT $limit OFFSET $offset`;
            parameters.limit = limit || 30;
            parameters.offset = offset || 0;
        }

        return { sql, parameters, returnOne: limit === 1 };
    };
};
