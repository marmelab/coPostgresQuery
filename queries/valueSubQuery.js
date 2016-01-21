import curry from '../utils/curry';

function valueSubQuery(writableFields, suffix) {
    return writableFields
    .map((field) => `$${field}${suffix}`)
    .join(', ');
}

export default curry(valueSubQuery);
