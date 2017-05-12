import update from './update';

export default ({
    table,
    updatableFields,
    primaryKey = 'id',
    returnFields,
}) => {
    const filterFields = [].concat(primaryKey);

    return update({ table, updatableFields, filterFields, returnFields }, true);
};
