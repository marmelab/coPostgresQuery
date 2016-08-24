export default function (object) {
    return Object.keys(object)
    .reduce(({ keys, values }, key) => ({
        keys: [
            ...keys,
            key,
        ],
        values: [
            ...values,
            object[key],
        ],
    }), { keys: [], values: [] });
}
