import update from './update';

export default ({
    table,
    writableFields,
    primaryKey = 'id',
    returnFields,
}) => {
    const filterFields = [].concat(primaryKey);

    return update({ table, writableFields, filterFields, returnFields }, true);
};
