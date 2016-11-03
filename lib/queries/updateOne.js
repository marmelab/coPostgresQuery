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
    } = this.config;

    const identifiers = sanitizeIdentifier(idFields, id);
    const parameters = {
        ...identifiers,
        ...sanitizeParameter(updatableFields, data),
    };

    const where = whereQuery(identifiers, idFields);

    const setQuery = updatableFields.reduce((result, field) => {
        if (idFields.indexOf(field) !== -1 || typeof data[field] === 'undefined') {
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

export default function (table, updatableFields, idFields = ['id'], returnFields = ['*']) {
    const config = {
        table,
        updatableFields,
        idFields: [].concat(idFields),
        returnFields,
    };


    return configurable(updateOne, config);
}
