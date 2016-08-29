export default function checkLiteralKeys(keys, object) {
    if (
        Object.keys(object).length !== keys.length ||
        Object.keys(object)
        .some((key) => keys.indexOf(key) === -1 || typeof object[key] === 'undefined')
    ) {
        throw new Error(`Given object: (${Object.keys(object).join(', ')}) does not match keys: (${keys.join(', ')})`);
    }

    return object;
}
