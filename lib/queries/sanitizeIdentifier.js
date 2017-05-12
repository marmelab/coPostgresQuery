import pipe from '../utils/pipe';
import curry from '../utils/curry';
import sanitizeParameter from './sanitizeParameter';
import checkLiteralKeys from '../utils/checkLiteralKeys';
import ensureIsSet from '../utils/ensureIsSet';

export const normalize = identifierFields => id =>
    (typeof id === 'object' ? id : { [identifierFields[0]]: id });

export const sanitizeIdentifierFunc = (identifierFields, id) => {
    try {
        return pipe(
            ensureIsSet,
            normalize(identifierFields),
            sanitizeParameter(identifierFields),
            checkLiteralKeys(identifierFields),
        )(id);
    } catch (error) {
        throw new Error(`Invalid identifier: ${error.message}`);
    }
};

export default curry(sanitizeIdentifierFunc);
