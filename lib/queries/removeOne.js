import remove from './remove';

export default ({
    table,
    idField = 'id',
    idFields = [idField],
    returnFields,
}) => remove({ table, filterFields: idFields, returnFields }, true);
