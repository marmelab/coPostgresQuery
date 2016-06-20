import curry from '../utils/curry';
import arrayToLitteral from '../utils/arrayToLitteral';
import { getFieldType } from './whereQuery';

function getTrueFieldName(fieldName, fields) {
    switch (getFieldType(fieldName, fields)) {
    case 'query':
        return fieldName;
    case 'from':
        return fieldName.substr(5);
    case 'to':
        return fieldName.substr(3);
    case 'like':
        return fieldName.substr(5);
    default:
        return;
    }
}

function sanitizeParameter(fields, parameters) {
    fields = Array.isArray(fields) ? arrayToLitteral(fields, undefined) : fields;
    const fieldNames = Object.keys(fields);

    return Object.keys({ ...fields, ...parameters })
    .reduce((sanitizedParameters, fieldName) => {
        const trueFieldName = getTrueFieldName(fieldName, fieldNames);
        if (!trueFieldName) {
            return sanitizedParameters;
        }

        let value = typeof parameters[fieldName] === 'undefined' ? fields[trueFieldName] : parameters[fieldName];
        if (fieldName.replace(trueFieldName, '') === 'like_') {
            value = `%${value}%`;
        }

        return typeof (value) === 'undefined' ?
        sanitizedParameters : {
            ...sanitizedParameters,
            [fieldName]: value
        };
    }, parameters.match && fieldNames.length > 0 ? { match: `%${parameters.match}%` } : {});
}

export default curry(sanitizeParameter);
