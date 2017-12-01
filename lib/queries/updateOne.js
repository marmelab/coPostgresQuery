import update from './update';

export default ({
    table,
    writableCols,
    primaryKey = 'id',
    returnCols,
    permanentFilters = {},
}) => {
    const filterCols = [].concat(primaryKey);

    return update({ table, writableCols, filterCols, returnCols, permanentFilters }, true);
};
