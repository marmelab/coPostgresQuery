import whereQuery from './whereQuery';
import sanitizeIdentifier from './sanitizeIdentifier';
import sanitizeParameter from './sanitizeParameter';
import returningQuery from './returningQuery';

export default ({
    table,
    updatableFields,
    idFields: ids = ['id'],
    returnFields,
    allowPrimaryKeyUpdate = false,
}) => {
    const idFields = [].concat(ids);
    const returning = returningQuery(returnFields);

    return (id, data) => {
        const identifiers = sanitizeIdentifier(idFields, id);
        const parameters = {
            ...identifiers,
            ...sanitizeParameter(updatableFields, data),
        };

        const where = whereQuery(identifiers, idFields);

        const setQuery = updatableFields.reduce((result, field) => {
            const isPrimaryKey = idFields.indexOf(field) !== -1;

            if ((!allowPrimaryKeyUpdate && isPrimaryKey) || typeof data[field] === 'undefined') {
                return result;
            }

            return [
                ...result,
                `${field}=$${field}`,
            ];
        }, []);

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
            returnOne: true,
        };
    };
};
