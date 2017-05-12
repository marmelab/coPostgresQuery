import removeOneQuery from './removeOne';
import insertOneQuery from './insertOne';
import selectOneQuery from './selectOne';
import selectQuery from './select';
import updateOneQuery from './updateOne';
import batchInsertQuery from './batchInsert';
import batchRemoveQuery from './batchRemove';
import countAllQuery from './countAll';

export default function ({
    table,
    primaryKey = 'id',
    returnFields,
    writableFields,
    searchableFields,
    specificSorts,
    groupByFields,
    withQuery,
    allowPrimaryKeyUpdate,
}) {
    const removeOne = removeOneQuery({ table, primaryKey });
    const insertOne = insertOneQuery({ table, writableFields, returnFields });
    const selectOne = selectOneQuery({ table, primaryKey, returnFields });
    const select = selectQuery({ table, primaryKey, returnFields, searchableFields, specificSorts, groupByFields, withQuery });
    const updateOne = updateOneQuery({ table, writableFields, primaryKey, returnFields, allowPrimaryKeyUpdate });
    const batchInsert = batchInsertQuery({ table, writableFields, returnFields });
    const batchRemove = batchRemoveQuery({ table, returnFields, primaryKey });
    const countAll = countAllQuery({ table });

    const queries = {
        removeOne,
        insertOne,
        selectOne,
        select,
        updateOne,
        batchInsert,
        batchRemove,
        countAll,
    };

    return queries;
}
