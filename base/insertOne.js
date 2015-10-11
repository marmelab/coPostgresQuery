'use strict';

import insertOneQuerier from '../queries/insertOne';

export default function (tableName, insertFields, returningFields = ['*']) {

    const insertOneQuery = insertOneQuerier(tableName, insertFields, returningFields);

    return function (client) {

        return function* insertOne(data) {

            return (yield client.query(insertOneQuery(data)))[0];
        };
    };
};
