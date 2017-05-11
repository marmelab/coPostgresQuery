import sanitizeParameter from './sanitizeParameter';
import arrayToLitteral from '../utils/arrayToLitteral';
import addSuffix from '../utils/addSuffix';

export default function (fields) {
    const sanitize = sanitizeParameter(arrayToLitteral(fields, null));

    return (entities) => entities
        .map(sanitize)
        .map((entity, index) => addSuffix(entity, index + 1))
        .reduce((result, entity) => ({ ...result, ...entity }), {});
}
