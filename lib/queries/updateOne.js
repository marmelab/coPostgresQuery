import update from './update';

export default ({
    table,
    updatableFields,
    primaryKey = ['id'],
    returnFields,
}) => update({ table, updatableFields, filterFields: primaryKey, returnFields }, true);
