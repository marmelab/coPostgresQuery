export default function (keys, values = []) {
    return keys.reduce((object, key, index) => ({
        ...object,
        [key]: Array.isArray(values) ? values[index] : values
    }), {});
};
