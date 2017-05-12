import remove from './remove';

export default ({
    table,
    primaryKey = 'id',
    returnCols,
}) => {
    const filterCols = [].concat(primaryKey);

    return remove({ table, filterCols, returnCols }, true);
};
