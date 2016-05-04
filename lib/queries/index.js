import { default as deleteOneQuerier } from '../queries/deleteOne';
import { default as insertOneQuerier } from '../queries/insertOne';
import { default as selectOneQuerier } from '../queries/selectOne';
import { default as selectPageQuerier } from '../queries/selectPage';
import { default as updateOneQuerier } from '../queries/updateOne';

export default function (table, fields, idFields, returnFields = ['*'], configurators = []) {
    const deleteOne = deleteOneQuerier(table, idFields);
    const insertOne = insertOneQuerier(table, fields);
    const selectOne = selectOneQuerier(table, idFields, returnFields);
    const selectPage = selectPageQuerier(table, fields, idFields);
    const updateOne = updateOneQuerier(table, fields, idFields);

    const queries = {
        deleteOne,
        insertOne,
        selectOne,
        selectPage,
        updateOne
    };

    [].concat(configurators).forEach(configure => configure(queries));

    return queries;
};
