import update from './update';

export default ({
    table,
    updatableFields,
    idField = 'id',
    idFields = [idField],
    returnFields,
}) => update({ table, updatableFields, filterFields: idFields, returnFields }, true);
