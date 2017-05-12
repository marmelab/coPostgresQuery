import sanitizeParameter from './sanitizeParameter';
import arrayToLitteral from '../../utils/arrayToLitteral';
import addSuffix from '../../utils/addSuffix';

export default function (cols) {
    const sanitize = sanitizeParameter(arrayToLitteral(cols, null));

    return (rows) => rows
        .map(sanitize)
        .map((row, index) => addSuffix(row, index + 1))
        .reduce((result, row) => ({ ...result, ...row }), {});
}
