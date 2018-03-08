import middleware from '../../utils/middleware';

export function getColPlaceHolder(column, value, not) {
    const normalizedColumn = column.replace('.', '__');
    const type = Array.isArray(value) ? 'IN' : value;
    switch (type) {
    case null:
        return `IS ${not ? 'NOT ' : ''}NULL`;
    case 'IS_NULL':
    case 'IS NULL':
    case 'IS_NOT_NULL':
    case 'IS NOT NULL':
        console.warn('Passing `IS (NOT) NULL` to filter value is deprecated, please pass null directly with not_ prefix if needed');
        return value;
    case 'IN':
        return `${not ? 'NOT ' : ''}IN (${value.map((_, index) => `$${normalizedColumn}${index + 1}`).join(', ')})`;
    default:
        return `${not ? '!=' : '='} $${normalizedColumn}`;
    }
}

export function getColType(column, searchableCols) {
    if (!searchableCols.length) {
        console.warn('There are no allowed columns to be searched, all filters will be ignored');
        return 'discarded';
    }
    if (column === 'match' && searchableCols.length > 0) {
        return 'match';
    }
    if (searchableCols.indexOf(column) !== -1) {
        return 'query';
    }
    if (column.indexOf('not_') === 0 && searchableCols.indexOf(column.substr(4)) !== -1) {
        return 'not';
    }
    if (column.indexOf('from_') === 0 && searchableCols.indexOf(column.substr(5)) !== -1) {
        return 'from';
    }
    if (column.indexOf('to_') === 0 && searchableCols.indexOf(column.substr(3)) !== -1) {
        return 'to';
    }
    if (column.indexOf('like_') === 0 && searchableCols.indexOf(column.substr(5)) !== -1) {
        return 'like';
    }
    if (column.indexOf('not_like_') === 0 && searchableCols.indexOf(column.substr(9)) !== -1) {
        return 'not like';
    }

    console.warn(`Ignoring filter: ${column}. Allowed columns: ${searchableCols}`);

    return 'discarded';
}

export function sortQueryType(filters, searchableCols) {
    return Object.keys(filters).reduce((result, col) => {
        const colType = getColType(col, searchableCols);

        return {
            ...result,
            [colType]: { ...result[colType], [col]: filters[col] },
        };
    }, { match: {}, from: {}, to: {}, query: {} });
}

export function getMatch(filters, searchableCols, whereParts = []) {
    return !searchableCols.length ? whereParts : Object.keys(filters)
        .reduce(result => ([
            ...result,
            `(${searchableCols.map(searchableCol => `${searchableCol}::text ILIKE $match`).join(' OR ')})`,
        ]), whereParts);
}

export function getLike(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column.substr(5)}::text ILIKE $${column.replace('.', '__')}`,
        ]), whereParts);
}

export function getNotLike(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column.substr(9)}::text NOT ILIKE $${column.replace('.', '__')}`,
        ]), whereParts);
}

export function getFrom(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column.substr(5)}::timestamp >= $${column.replace('.', '__')}::timestamp`,
        ]), whereParts);
}

export function getTo(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column.substr(3)}::timestamp <= $${column.replace('.', '__')}::timestamp`,
        ]), whereParts);
}

export function getNot(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column.substr(4)} ${getColPlaceHolder(column, filters[column], true)}`,
        ]), whereParts);
}

export function getQuery(filters, searchableCols, whereParts = []) {
    return Object.keys(filters)
        .reduce((result, column) => ([
            ...result,
            `${column} ${getColPlaceHolder(column, filters[column])}`,
        ]), whereParts);
}

export function getResult(filters, searchableCols, whereParts = []) {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
}

export default function whereQuery(filters, searchableCols) {
    return middleware(sortQueryType(filters, searchableCols), searchableCols)
        .use(getMatch, 'match')
        .use(getFrom, 'from')
        .use(getTo, 'to')
        .use(getLike, 'like')
        .use(getNotLike, 'not like')
        .use(getNot, 'not')
        .use(getQuery, 'query')
        .use(getResult)
        .execute([]);
}
