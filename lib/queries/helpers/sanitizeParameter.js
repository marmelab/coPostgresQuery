import curry from '../../utils/curry';
import arrayToLitteral from '../../utils/arrayToLitteral';
import { getColType } from './whereQuery';

function getTrueColName(colName, cols) {
    switch (getColType(colName, cols)) {
    case 'query':
        return colName;
    case 'from':
        return colName.substr(5);
    case 'to':
        return colName.substr(3);
    case 'like':
        return colName.substr(5);
    case 'not like':
        return colName.substr(9);
    case 'not':
        return colName.substr(4);
    default:
        return null;
    }
}

function sanitizeParameter(rawCols, parameters) {
    const cols = Array.isArray(rawCols) ? arrayToLitteral(rawCols, undefined) : rawCols;
    const colNames = Object.keys(cols);

    return Object.keys({ ...cols, ...parameters })
    .reduce((sanitizedParameters, colName) => {
        const trueColName = getTrueColName(colName, colNames);
        if (!trueColName) {
            return sanitizedParameters;
        }

        let value = typeof parameters[colName] === 'undefined' ? cols[trueColName] : parameters[colName];
        if (
            colName.replace(trueColName, '') === 'like_'
            || colName.replace(trueColName, '') === 'not_like_'
        ) {
            value = `%${value}%`;
        }

        return typeof (value) === 'undefined' ?
        sanitizedParameters : {
            ...sanitizedParameters,
            [colName.replace('.', '__')]: value,
        };
    }, parameters.match && colNames.length > 0 ? { match: `%${parameters.match}%` } : {});
}

export default curry(sanitizeParameter);
