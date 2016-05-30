export default function combineLiterals(literals) {
    return literals.reduce((result, literal) => {
        return {
            ...result,
            ...Object.keys(literal).reduce((r, key) => {
                return {
                    ...r,
                    [key]: (result[key] || []).concat(literal[key])
                };
            }, {})
        };
    }, {});
}
