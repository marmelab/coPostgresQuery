import remove from './remove';

export default ({
    table,
    primaryKey = ['id'],
    returnFields,
}) => remove({ table, filterFields: primaryKey, returnFields }, true);
