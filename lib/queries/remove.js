import sanitizeIdentifier from './sanitizeIdentifier';
import sanitizeParameter from './sanitizeParameter';
import whereQuery from './whereQuery';
import returningQuery from './returningQuery';

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
