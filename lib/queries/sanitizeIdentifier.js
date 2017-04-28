import curry from '../utils/curry';
import sanitizeParameter from './sanitizeParameter';
import checkLiteralKeys from '../utils/checkLiteralKeys';

export function sanitizeIdentifierFunc(identifierFields, id) {
    if (!id) {
        throw new Error('No identifiers specified.');
    }

    return checkLiteralKeys(identifierFields, sanitizeParameter(
        identifierFields,
        Object.prototype.toString.call(id) === '[object Object]' ? id : { [identifierFields[0]]: id }
    ));
}

export default curry(sanitizeIdentifierFunc);
