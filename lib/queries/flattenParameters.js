export default function flattenParameters(parameters) {
    return Object.keys(parameters)
    .reduce((result, key) => {
        if (!Array.isArray(parameters[key])) {
            return {
                ...result,
                [key]: parameters[key]
            };
        }

        const multiKey = parameters[key]
        .reduce((keys, value, index) => {
            const newKey = `${key}${index + 1}`;
            if (typeof parameters[newKey] !== 'undefined') {
                throw new Error(`Cannot flatten "${key}:[${parameters[key]}]" parameter, "${key}${index + 1}" already exists.`);
            }
            return {
                ...keys,
                [newKey]: value
            };
        }, {});

        return {
            ...result,
            ...multiKey
        };
    }, {});
}
