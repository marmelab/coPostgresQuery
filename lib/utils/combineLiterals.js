export default function combineLiterals(literals) {
    return literals.reduce((result, literal) => ({
        ...result,
        ...Object.keys(literal).reduce((r, key) => ({
            ...r,
            [key]: (result[key] || []).concat(literal[key]),
        }), {}),
    }), {});
}
