'use strict';

module.exports = function (client, tableName, exposedFields, searchableFields, sortableFields, idOptions, extraOptions) {
    idOptions = idOptions || {};
    var idFieldName = idOptions.name || 'id';
    var exposedFieldsString = exposedFields.join(', ');

    extraOptions = extraOptions || {};
    var specificSorts = extraOptions.specificSorts;
    var withQuery = extraOptions.withQuery || tableName.indexOf('JOIN') !== -1;

    var baseQuery = `SELECT ${exposedFieldsString}, COUNT(*) OVER() as totalCount FROM ${tableName}`;
    if (withQuery) {// withQuery add a temporary result table that allow to filter on computed and joined field
        baseQuery = 'WITH result AS (' + baseQuery + ') SELECT *, COUNT(*) OVER() as totalCount FROM result';
    }

    searchableFields = searchableFields || exposedFields;
    sortableFields = sortableFields || exposedFields;

    function* selectPage(limit, offset, match, sort, sortDir, other) {
        var query = baseQuery;

        var params = {};

        var whereParts = [];
        var fieldPlaceholder;
        // handle filter param
        if (match && searchableFields.length > 0) {
            var whereFilerParts = [];
            match = '%' + match + '%';
            params.match = match;
            searchableFields.forEach(function (field) {
                whereFilerParts.push(field + '::text ILIKE $match');
            });
            whereParts.push('(' + whereFilerParts.join(' OR ') + ')');
        }
        // handle other param
        if (other) {
            Object.keys(other)
            .forEach(function (field) {
                if (field.indexOf('from_') === 0 && searchableFields.indexOf(field.substr(5)) !== -1) {

                    whereParts.push(field.substr(5) + '::timestamp >= $' + field + '::timestamp');
                    params[field] = other[field];
                    return;
                }
                if (field.indexOf('to_') === 0 && searchableFields.indexOf(field.substr(3)) !== -1) {

                    whereParts.push(field.substr(3) + '::timestamp <= $' + field + '::timestamp');
                    params[field] = other[field];
                    return;
                }
                if (other[field] === 'IS_NULL') {
                    whereParts.push(field + ' IS NULL');
                    return;
                }
                if (other[field] === 'IS_NOT_NULL') {
                    whereParts.push(field + ' IS NOT NULL');

                    return;
                }
                if (searchableFields.indexOf(field) !== -1) {
                    fieldPlaceholder = '$' + field;
                    if (Array.isArray(other[field])) {
                        fieldPlaceholder = 'ANY($' + field + ')';
                    }

                    whereParts.push(field + ' = ' + fieldPlaceholder);
                    params[field] = other[field];
                }
            });

        }

        if (whereParts.length > 0) {
            query += ' WHERE ' + whereParts.join(' AND ');
        }

        // always sort by id to avoid randomness in case of identical sortField value
        var sortQuery = [idFieldName + ' ASC'];
        if (sort) {
            sort = sort.toLowerCase();
            if (specificSorts && specificSorts.hasOwnProperty(sort)) {
                var specificSort = specificSorts[sort].reduce(function (result, condition, index) {
                    return result + ' WHEN \'' + condition + '\' THEN ' + (index + 1);
                }, 'CASE ' + sort);
                sortQuery.unshift(specificSort + ' END ' + (sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC'));
            } else if (sortableFields.indexOf(sort) !== -1) {
                sortQuery.unshift(sort + (sortDir.toLowerCase() === 'asc' ? ' ASC' : ' DESC'));
            }
        }
        query += ' ORDER BY ' + sortQuery.join(', ');

        if (limit) {
            query += ' LIMIT $limit OFFSET $offset';
            params.limit = limit || 30;
            params.offset = offset || 0;
        }

        var results = yield client.query_(query, params);

        return results.rows;
    }

    return selectPage;
};
