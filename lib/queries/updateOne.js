import configurable from 'configurable.js';
import whereQuery from './whereQuery';
import sanitizeIdentifier from './sanitizeIdentifier';
import sanitizeParameter from './sanitizeParameter';

function updateOne(id, data) {
    const {
        table,
        idFields,
        updatableFields,
        returnFields,
        allowPrimaryKeyUpdate,
    } = this.config;

    const identifiers = sanitizeIdentifier(idFields, id);
    const parameters = {
        ...identifiers,
        ...sanitizeParameter(updatableFields, data),
    };

    const where = whereQuery(identifiers, idFields);

    const setQuery = updatableFields.reduce((result, field) => {
        const isPrimaryKey = idFields.indexOf(field) !== -1;

        if ((!allowPrimaryKeyUpdate && isPrimaryKey)|| typeof data[field] === 'undefined') {
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
RETURNING ${returnFields.join(', ')}`
    );

    return {
        sql,
        parameters,
    };
}

export default ({
    table,
    updatableFields,
    idFields = ['id'],
    returnFields = ['*'],
    allowPrimaryKeyUpdate = false,
} = {}) =>
    configurable(updateOne, {
        table,
        updatableFields,
        idFields: [].concat(idFields),
        returnFields,
        allowPrimaryKeyUpdate,
    });
