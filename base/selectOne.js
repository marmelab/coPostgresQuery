import selectOneQuerier from '../queries/selectOne';

export default function (table, selectorFields, returningFields = ['*']) {
    const selectOneQuery = selectOneQuerier(table, selectorFields, returningFields);
    return function (client) {
        return function* (parameters) {
            return yield client.query(selectOneQuery(parameters));
        };
    };
}
