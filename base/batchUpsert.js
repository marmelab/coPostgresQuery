import batchUpsertQuerier from '../queries/batchUpsert';

export default function (table, primaryFields, secondaryFields, returnFields) {

    const batchUpsertQuery = batchUpsertQuerier(table, primaryFields, secondaryFields, returnFields);

    return function (client) {

        return function* batchUpsert(entities) {
            return yield client.query(batchUpsertQuery(entities));
        };
    };
};
