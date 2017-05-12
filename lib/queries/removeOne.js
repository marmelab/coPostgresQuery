import remove from './remove';

export default ({
    table,
    primaryKey = 'id',
    returnFields,
}) => {
    const filterFields = [].concat(primaryKey);

    return remove({ table, filterFields, returnFields }, true);
};
