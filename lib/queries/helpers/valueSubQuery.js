import curry from '../../utils/curry';

function valueSubQuery(writableCols, suffix) {
    return writableCols
    .map((column) => `$${column}${suffix}`)
    .join(', ');
}

export default curry(valueSubQuery);
