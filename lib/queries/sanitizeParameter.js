import curry from '../utils/curry';
import arrayToLitteral from '../utils/arrayToLitteral';

function sanitizeParameter(fields, parameters) {
    fields = Array.isArray(fields) ? arrayToLitteral(fields, undefined) : fields;

    return Object.keys(fields)
    .reduce((sanitizedParameters, key) => {
        const value = typeof parameters[key] === 'undefined' ? fields[key] : parameters[key];
        return typeof (value) === 'undefined' ?
        sanitizedParameters : {
            ...sanitizedParameters,
            [key]: value
        };
    }, parameters.match && Object.keys(fields).length > 0 ? { match: parameters.match } : {});
}

export default curry(sanitizeParameter);
