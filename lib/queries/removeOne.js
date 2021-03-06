import remove from './remove';

export default ({
    table,
    primaryKey = 'id',
    returnCols,
    permanentFilters = {},
}) => {
    const filterCols = [].concat(primaryKey);

    return remove({ table, filterCols, returnCols, permanentFilters }, true);
};
