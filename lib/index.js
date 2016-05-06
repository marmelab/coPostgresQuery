import queries, { factories } from './queries';
import clientPg from './services/pg-client';

export const link = query => execute => {
    return function (...args) {
        return execute(query(...args));
    };
};

export const multiLink = queryLiteral => client => {
    return Object.keys(queryLiteral)
    .reduce((result, key) => {
        const execute = key.match(/One/) ? client.queryOne : client.query;

        return {
            ...result,
            [key]: link(queryLiteral[key])(execute)
        };
    }, {});
};

export function crud(...args) {
    return multiLink(queries(...args));
}

export const insertOne = (...args) => client => {
    return link(factories.insertOne(...args))(client.queryOne);
};

export const selectOne = (...args) => client => {
    return link(factories.selectOne(...args))(client.queryOne);
};

export const updateOne = (...args) => client => {
    return link(factories.updateOne(...args))(client.queryOne);
};

export const deleteOne = (...args) => client => {
    return link(factories.deleteOne(...args))(client.queryOne);
};

export const batchInsert = (...args) => client => {
    return link(factories.batchInsert(...args))(client.query);
};

export const batchDelete = (...args) => (client) => {
    return link(factories.batchDelete(...args))(client.query);
};

export const batchUpsert = (...args) => client => {
    return link(factories.batchUpsert(...args))(client.query);
};

export const upsertOne = (...args) => client => {
    return link(factories.upsertOne(...args))(client.queryOne);
};

export const pgClient = clientPg;
