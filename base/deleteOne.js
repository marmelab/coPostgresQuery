'use strict';

import deleteOneQuerier from '../queries/deleteOne';

export default function (table, identifiers, returningFields = ['*']) {
    const deleteOneQuery = deleteOneQuerier(table, identifiers, returningFields);

    return function (client) {

        return function* deleteOne(id) {
            if (!id) {
                throw new Error(`No id specified for deleting ${table} entity.`);
            }

            let entity = (yield client.query(deleteOneQuery(id)))[0];
            if (!entity) {
                throw new Error('not found');
            }

            return entity;
        };
    };
};
