import curry from '../utils/curry';
import arrayToLitteral from '../utils/arrayToLitteral';

function sanitizeParameter(fields, parameters) {
    fields = Array.isArray(fields) ? arrayToLitteral(fields, undefined) : fields;

    return Object.keys(fields)
    .reduce((result, key) => {
        const value = typeof parameters[key] === 'undefined' ? fields[key] : parameters[key];
        return typeof (value) === 'undefined' ?
        result : {
            ...result,
            [key]: value
        };
    }, {});
}

export default curry(sanitizeParameter);
