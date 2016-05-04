const tokenPattern = /\$[a-zA-Z]([a-zA-Z0-9_]*)\b/g;

export default function namedToNumericParameter(namedSql, namedParameters = {}) {
    const fillableTokens = Object.keys(namedParameters);
    let matchedTokens = namedSql.match(tokenPattern);
    if (!matchedTokens) {
        return { sql: namedSql, parameters: [] };
    }
    matchedTokens = matchedTokens
    .map((token)=> token.substring(1)) // Remove leading dollar sign
    .filter((value, index, self) => self.indexOf(value) === index);

    const fillTokens = fillableTokens.filter((value) => matchedTokens.indexOf(value) > -1);
    const parameters = fillTokens.map((token)=> namedParameters[token]);

    const unmatchedTokens = matchedTokens.filter((value) => fillableTokens.indexOf(value) < 0);

    if (unmatchedTokens.length) {
        throw new Error(`Missing Parameters: ${unmatchedTokens.join(', ')}`);
    }

    const sql = fillTokens.reduce((partiallyInterpolated, token, index) => {
        const replaceAllPattern = new RegExp(`\\$${fillTokens[index]}\\b`, 'g');

        return partiallyInterpolated.replace(replaceAllPattern, `$${index + 1}`);
    }, namedSql);

    return {
        sql,
        parameters
    };
}
