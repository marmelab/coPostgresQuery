'use strict';

import middleware from '../utils/middleware';

export function getFieldPlaceHolder(field, value) {
    value = Array.isArray(value) ? 'ANY' : value;
    return (value === 'IS_NULL' || value === 'IS_NOT_NULL' || value === 'ANY') ? `${value}` : `$${field}`;
}

export function getFieldType(field, searchableFields) {
    if (!searchableFields.length) {
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

    return 'discarded';
}

export function sortQueryType(filters, searchableFields) {
    return Object.keys(filters).reduce(function (result, field) {
        const fieldType = getFieldType(field, searchableFields);
        return {
            ...result,
            [fieldType]: { ...result[fieldType], [field]: filters[field] }
        };

    }, { match: {}, from: {}, to: {}, query: {} });
}

export function getMatch(filters, searchableFields, result = { whereParts: [], parameters: {} }) {
    return !searchableFields.length ? result : Object.keys(filters)
    .reduce(({ parameters, whereParts }, field) => ({
        parameters: {
            ...parameters,
            [field]: `%${filters[field]}%`
        },
        whereParts: [
            ...whereParts,
            `(${searchableFields.map(searchableField => `${searchableField}::text ILIKE $match`).join(' OR ')})`
        ]
    }), result);
}

export function getFrom(filters, searchableFields, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .reduce(({ parameters, whereParts }, field) => ({
        parameters: {
            ...parameters,
            [field]: filters[field]
        },
        whereParts: [
            ...whereParts,
            `${field.substr(5)}::timestamp >= $${field}::timestamp`
        ]
    }), result);
}

export function getTo(filters, searchableFields, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .reduce(({ parameters, whereParts }, field) => ({
        parameters: {
            ...parameters,
            [field]: filters[field]
        },
        whereParts: [
            ...whereParts,
            `${field.substr(3)}::timestamp <= $${field}::timestamp`
        ]
    }), result);
}

export function getQuery(filters, searchableFields, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .reduce(({ parameters, whereParts }, field) => ({
        parameters: {
            ...parameters,
            [field]: filters[field]
        },
        whereParts: [
            ...whereParts,
            `${field} = ${getFieldPlaceHolder(field, filters[field])}`
        ]
    }), result);
}

export function getResult(filters, searchableFields, { whereParts = [], parameters = {} }) {
    return {
        parameters,
        query: `WHERE ${whereParts.join(' AND ')}`
    };
}

export default function whereQuery(filters, searchableFields) {
    return middleware(sortQueryType(filters, searchableFields), searchableFields)
    .use(getMatch, 'match')
    .use(getFrom, 'from')
    .use(getTo, 'to')
    .use(getQuery, 'query')
    .use(getResult)
    .execute({ whereParts: [], parameters: {} });
}
