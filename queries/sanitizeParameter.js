import curry from '../utils/curry';
import arrayToLitteral from '../utils/arrayToLitteral';

function sanitizeParameter(fields, parameters) {
    fields = Array.isArray(fields) ? arrayToLitteral(fields, undefined) : fields;

    return Object.keys(fields)
    .reduce((result, key) => {
        return typeof (parameters[key] || fields[key]) === 'undefined' ?
        result : {
            ...result,
            [key]: parameters[key] || fields[key]
        };
    }, {});
}

export default curry(sanitizeParameter);
