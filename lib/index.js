import queries from './queries';
import clientPg from './services/pg-client';

export const link = query => client => {
    return function (...args) {
        return client.query(query(...args));
    };
};

export const multiLink = queryLiteral => client => {
    return Object.keys(queryLiteral)
    .reduce((result, key) => ({ ...result, [key]: link(queryLiteral[key])(client)}), {});
};

export function crud(...args) {
    return multiLink(queries(...args));
}

export const pgClient = clientPg;
