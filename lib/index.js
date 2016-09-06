import queries, { factories } from './queries';

import Pool from './services/pg-pool';

export const link = query => execute => (...args) => execute(query(...args));

export const multiLink = queryLiteral => client => Object.keys(queryLiteral)
.reduce((result, key) => {
    const execute = key.match(/One|count/) ? client.queryOne : client.query;

    return {
        ...result,
        [key]: link(queryLiteral[key])(execute),
    };
}, {});

export function crud(...args) {
    return multiLink(queries(...args));
}

export const insertOne = (...args) => client =>
    link(factories.insertOne(...args))(client.queryOne);

export const selectOne = (...args) => client =>
    link(factories.selectOne(...args))(client.queryOne);

export const selectPage = (...args) => client =>
    link(factories.selectPage(...args))(client.query);

export const updateOne = (...args) => client =>
    link(factories.updateOne(...args))(client.queryOne);

export const deleteOne = (...args) => client =>
    link(factories.deleteOne(...args))(client.queryOne);

export const batchInsert = (...args) => client =>
    link(factories.batchInsert(...args))(client.query);

export const batchDelete = (...args) => (client) =>
    link(factories.batchDelete(...args))(client.query);

export const batchUpsert = (...args) => client =>
    link(factories.batchUpsert(...args))(client.query);

export const upsertOne = (...args) => client =>
    link(factories.upsertOne(...args))(client.queryOne);

export const selectByOrderedFieldValues = (...args) => client =>
    link(factories.selectByOrderedFieldValues(...args))(client.query);

export const PgPool = Pool;
