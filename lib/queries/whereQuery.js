import middleware from '../utils/middleware';

export function getFieldPlaceHolder(field, value) {
    const type = Array.isArray(value) ? 'IN' : value;
    switch (type) {
    case 'IS_NULL':
    case 'IS_NOT_NULL':
        return value;
    case 'IN':
        return `IN (${value.map((_, index) => `$${field.replace('.', '__')}${index + 1}`).join(', ')})`;
    default:
        return `= $${field.replace('.', '__')}`;
    }
}

export function getFieldType(field, searchableFields) {
    if (!searchableFields.length) {
        console.warn('There are no allowed fields to be searched, all filters will be ignored');
        return 'discarded';
    }
    if (field === 'match' && searchableFields.length > 0) {
        return 'match';
    }
    if (searchableFields.indexOf(field) !== -1) {
        return 'query';
    }
    if (field.indexOf('from_') === 0 && searchableFields.indexOf(field.substr(5)) !== -1) {
        return 'from';
    }
    if (field.indexOf('to_') === 0 && searchableFields.indexOf(field.substr(3)) !== -1) {
        return 'to';
    }
    if (field.indexOf('like_') === 0 && searchableFields.indexOf(field.substr(5)) !== -1) {
        return 'like';
    }

    console.warn(`Ignoring filter: ${field}. Allowed fields: ${searchableFields}`);

    return 'discarded';
}

export function sortQueryType(filters, searchableFields) {
    return Object.keys(filters).reduce((result, field) => {
        const fieldType = getFieldType(field, searchableFields);

        return {
            ...result,
            [fieldType]: { ...result[fieldType], [field]: filters[field] },
        };
    }, { match: {}, from: {}, to: {}, query: {} });
}

export function getMatch(filters, searchableFields, whereParts = []) {
    return !searchableFields.length ? whereParts : Object.keys(filters)
    .reduce((result) => ([
        ...result,
        `(${searchableFields.map(searchableField => `${searchableField}::text ILIKE $match`).join(' OR ')})`,
    ]), whereParts);
}

export function getLike(filters, searchableFields, whereParts = []) {
    return Object.keys(filters)
    .reduce((result, field) => ([
        ...result,
        `${field.substr(5)}::text ILIKE $${field.replace('.', '__')}`,
    ]), whereParts);
}

export function getFrom(filters, searchableFields, whereParts = []) {
    return Object.keys(filters)
    .reduce((result, field) => ([
        ...result,
        `${field.substr(5)}::timestamp >= $${field.replace('.', '__')}::timestamp`,
    ]), whereParts);
}

export function getTo(filters, searchableFields, whereParts = []) {
    return Object.keys(filters)
    .reduce((result, field) => ([
        ...result,
        `${field.substr(3)}::timestamp <= $${field.replace('.', '__')}::timestamp`,
    ]), whereParts);
}

export function getQuery(filters, searchableFields, whereParts = []) {
    return Object.keys(filters)
    .reduce((result, field) => ([
        ...result,
        `${field} ${getFieldPlaceHolder(field, filters[field])}`,
    ]), whereParts);
}

export function getResult(filters, searchableFields, whereParts = []) {
    return whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
}

export default function whereQuery(filters, searchableFields) {
    return middleware(sortQueryType(filters, searchableFields), searchableFields)
    .use(getMatch, 'match')
    .use(getFrom, 'from')
    .use(getTo, 'to')
    .use(getLike, 'like')
    .use(getQuery, 'query')
    .use(getResult)
    .execute([]);
}
