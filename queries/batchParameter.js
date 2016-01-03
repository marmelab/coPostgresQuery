import sanitizeParameter from './sanitizeParameter';

export function addSuffix(object, suffix) {
    return Object.keys(object)
    .reduce((result, key) => {
        return {
            ...result,
            [key + suffix]: object[key]
        };
    }, {});
};

export function merge(first, second) {
    return {
        ...first,
        ...second
    };
};

export default function (fields) {
    const sanitize = sanitizeParameter(fields);

    return function (entities) {
        return entities
        .map(sanitize)
        .map(addSuffix)
        .reduce(merge, {});
    };
};
