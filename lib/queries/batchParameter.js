import sanitizeParameter from './sanitizeParameter';
import arrayToLitteral from '../utils/arrayToLitteral';

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
    const sanitize = sanitizeParameter(arrayToLitteral(fields, null));

    return function (entities) {
        return entities
        .map(sanitize)
        .map((entity, index) => addSuffix(entity, index + 1))
        .reduce(merge, {});
    };
};
