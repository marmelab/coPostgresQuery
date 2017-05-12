import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import sanitizeParameter from './helpers/sanitizeParameter';
import whereQuery from './helpers/whereQuery';
import returningQuery from './helpers/returningQuery';

export default ({ table, filterFields, returnFields }, _one = false) => {
    const returning = returningQuery(returnFields);

    return (id) => {
        const parameters = _one ? sanitizeIdentifier(filterFields, id) : sanitizeParameter(filterFields, id);
        const where = whereQuery(parameters, filterFields);
        const sql = `DELETE FROM ${table} ${where} ${returning}`;

        return {
            sql,
            parameters,
            returnOne: _one,
        };
    };
};
