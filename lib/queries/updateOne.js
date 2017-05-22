import update from './update';

export default ({
    table,
    writableCols,
    primaryKey = 'id',
    returnCols,
}) => {
    const filterCols = [].concat(primaryKey);

    return update({ table, writableCols, filterCols, returnCols }, true);
};
