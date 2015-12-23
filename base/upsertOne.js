import upsertOneQuerier from '../queries/upsertOne';
import selectOneQuerier from '../queries/selectOne';

export default function (table, primaryFields, secondaryFields, autoIncrementField, returningFields = secondaryFields) {

    const upsertOneQuery = upsertOneQuerier(table, primaryFields, secondaryFields, autoIncrementField, returningFields);
    const selectOneQuery = selectOneQuerier(table, primaryFields, returningFields);

    return function (client) {
        return function* upsertOne(entity) {
            yield client.query(upsertOneQuery(entity));

            return (yield client.query(selectOneQuery(entity)))[0];
        };
    };
};
