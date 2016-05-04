import queries from '../queries';

export const link = query => client => {
    return function (...args) {
        return client.query(query(...args));
    };
};

export const multiLink = queryLiteral => client => {
    return Object.keys(queryLiteral)
    .reduce((result, key) => ({ ...result, [key]: link(queryLiteral[key], client)}), {});
};

export default function (...args) {
    return multiLink(queries(...args));
}
