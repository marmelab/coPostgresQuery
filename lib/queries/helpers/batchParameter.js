import sanitizeParameter from './sanitizeParameter';
import arrayToLitteral from '../../utils/arrayToLitteral';
import addSuffix from '../../utils/addSuffix';

export default function (fields) {
    const sanitize = sanitizeParameter(arrayToLitteral(fields, null));

    return (rows) => rows
        .map(sanitize)
        .map((row, index) => addSuffix(row, index + 1))
        .reduce((result, row) => ({ ...result, ...row }), {});
}
