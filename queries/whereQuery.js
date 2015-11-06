'use strict';

import middleware from '../utils/middleware';

export function getFieldPlaceHolder(field, value) {
    return `${field} ${ value === 'IS_NULL' || value === 'IS_NOT_NULL' ? value : `$${field}`}`;
}

export function getMatch({ filter, searchableFields }, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filter)
    .filter((field) => field === 'match' && searchableFields.length > 0)
    .reduce(({ parameters, whereParts }, field) => ({
        parameters: {
            ...parameters,
            [field]: `%${filter[field]}%`
        },
        whereParts: [
            ...whereParts,
            `(${searchableFields.map(searchableField => `${searchableField}::text ILIKE $match`).join(' OR ')})`
        ]
    }), result);
}

export function getFrom({ filters, searchableFields }, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .filter((field) => field.indexOf('from_') === 0 && searchableFields.indexOf(field.substr(5)) !== -1)
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

export function getTo({ filters, searchableFields }, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .filter((field) => field.indexOf('to_') === 0 && searchableFields.indexOf(field.substr(3)) !== -1)
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

export function getQuery({ filters, searchableFields }, result = { whereParts: [], parameters: {} }) {
    return Object.keys(filters)
    .filter((field) => searchableFields.indexOf(field) !== -1)
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

export function getResult({ filters, searchableFields }, { whereParts = [], parameters = {} }) {
    return {
        parameters,
        query: ` WHERE ${whereParts.join(' AND ')}`
    };
}

export default function whereQuery(filters, searchableFields) {

    return middleware({ filters, searchableFields })
    .chain(getMatch)
    .chain(getFrom)
    .chain(getTo)
    .chain(getQuery)
    .chain(getResult)
    .execute({ whereParts: [], parameters: {} });
}
