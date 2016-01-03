import curry from '../utils/curry';
import arrayToLitteral from '../utils/arrayToLitteral';

function sanitizeParameter(fields, parameters) {
    fields = Array.isArray(fields) ? arrayToLitteral(fields) : fields;

    return Object.keys(fields)
    .reduce((result, key) => {
        return typeof (parameters[key] || fields[key] || undefined) === 'undefined' ?
        result : {
            ...result,
            [key]: parameters[key] || fields[key] || undefined
        };
    }, {});
}

export default curry(sanitizeParameter);
