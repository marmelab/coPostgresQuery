import curry from '../utils/curry';

function valueSubQuerier(writableFields, suffix) {
    return writableFields
    .map((field) => `$${field}${suffix}`)
    .join(', ');
}

export default curry(valueSubQuerier);
