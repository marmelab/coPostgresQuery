export default function (keys, values = []) {
    return keys.reduce((object, key, index) => ({
        ...object,
        [key]: values[index] || null
    }), {});
};
