import whereQuery from './whereQuery';
import sanitizeParameter from './sanitizeParameter';
import returningQuery from './returningQuery';
import addSuffix from '../utils/addSuffix';

export default ({
    table,
    updatableFields,
    filterFields: selectors,
    returnFields,
}) => {
    const filterFields = [].concat(selectors);
    const returning = returningQuery(returnFields);

    return (filter, data) => {
        const filters = sanitizeParameter(filterFields, filter);
        const updateParameters = sanitizeParameter(updatableFields, data);
        const parameters = {
            ...filters,
            ...addSuffix(updateParameters, '_u'),
        };

        const where = whereQuery(filters, filterFields);

        const setQuery = updatableFields.reduce((result, field) => ([
            ...result,
            `${field}=$${field}_u`,
        ]), []);

        if (Object.keys(parameters).length === 1) {
            throw new Error('no valid column to set');
        }

        const sql = (
`UPDATE ${table}
SET ${setQuery.join(', ')}
${where}
${returning}`
        );

        return {
            sql,
            parameters,
        };
    };
};
