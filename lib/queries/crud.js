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
    returnCols,
    writableCols,
    searchableCols,
    specificSorts,
    groupByCols,
    withQuery,
    permanentFilters = {},
    allowPrimaryKeyUpdate,
}) {
    const removeOne = removeOneQuery({ table, primaryKey });
    const insertOne = insertOneQuery({ table, writableCols, returnCols });
    const selectOne = selectOneQuery({ table, primaryKey, returnCols, permanentFilters });
    const select = selectQuery({
        table,
        primaryKey,
        returnCols,
        searchableCols,
        specificSorts,
        groupByCols,
        withQuery,
        permanentFilters,
    });
    const updateOne = updateOneQuery({ table, writableCols, primaryKey, returnCols, allowPrimaryKeyUpdate });
    const batchInsert = batchInsertQuery({ table, writableCols, returnCols });
    const batchRemove = batchRemoveQuery({ table, returnCols, primaryKey });
    const countAll = countAllQuery({ table, permanentFilters });

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
