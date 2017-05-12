import sanitizeIdentifier from './helpers/sanitizeIdentifier';
import sanitizeParameter from './helpers/sanitizeParameter';
import whereQuery from './helpers/whereQuery';
import returningQuery from './helpers/returningQuery';

export default ({ table, filterCols, returnCols }, _one = false) => {
    const returning = returningQuery(returnCols);

    return (id) => {
        const parameters = _one ? sanitizeIdentifier(filterCols, id) : sanitizeParameter(filterCols, id);
        const where = whereQuery(parameters, filterCols);
        const sql = `DELETE FROM ${table} ${where} ${returning}`;

        return {
            sql,
            parameters,
            returnOne: _one,
        };
    };
};
