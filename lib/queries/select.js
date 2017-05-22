import flatten from '../utils/flatten';
import whereQuery from './helpers/whereQuery';
import sanitizeParameter from './helpers/sanitizeParameter';

export default ({
    table,
    primaryKey: ids = 'id',
    returnCols,
    searchableCols = returnCols || [],
    specificSorts = {},
    groupByCols = [],
    withQuery = table.indexOf('JOIN') !== -1,
    returnOne,
}) => {
    const primaryKey = [].concat(ids);
    const select = returnCols.length ? returnCols.join(', ') : '*';

    return ({ limit, offset, filters = {}, sort, sortDir } = { filters: {} }) => {
        const where = whereQuery(filters, searchableCols);
        let sql = `SELECT ${select} FROM ${table} ${where}`;

        if (groupByCols.length > 0) {
            sql = `${sql} GROUP BY ${groupByCols.join(', ')}`;
        }
        // withQuery add a temporary result table that allows to filters on computed and joined column
        if (withQuery) {
            sql = (
`WITH result AS (
${sql.trim()}
) SELECT * FROM result`
            );
        }

        const parameters = flatten(sanitizeParameter(searchableCols, filters));

        // always sort by ids to avoid randomness in case of identical sort column value
        const sortQuery = [primaryKey.map(idCol => `${idCol} ASC`).join(', ')];
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
            } else if (returnCols.indexOf(normalizedSort) !== -1) {
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

        return { sql, parameters, returnOne };
    };
};
