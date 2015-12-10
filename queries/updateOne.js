'use strict';

import whereQuery from './whereQuery';

export default function (tableName, fields, idFieldNames = ['id'], returningFields = ['*']) {
    idFieldNames = Array.isArray(idFieldNames) ? idFieldNames : [idFieldNames];

    return function updateOne(id, data) {
        if (!id) {
            throw new Error(`No id specified for updating ${tableName} entity.`);
        }
        id = Object.prototype.toString.call(id) === '[object Object]' ? id : {[idFieldNames[0]]: id};

        if (Object.keys(id).length !== idFieldNames.length || Object.keys(id).some((key) => idFieldNames.indexOf(key) === -1)) {
            throw new Error(`Given ids: (${Object.keys(id).join(', ')}) does not match idFieldNames: (${idFieldNames.join(', ')})`);
        }

        const where = whereQuery(id, idFieldNames);

        const { setQuery, parameters } = fields.reduce((result, field) => {
            if (idFieldNames.indexOf(field) !== -1 || typeof data[field] === 'undefined') {
                return result;
            }

            return {
                setQuery: [
                    ...result.setQuery,
                    `${field}=$${field}`
                ],
                parameters: {
                    ...result.parameters,
                    [field]: data[field]
                }
            };
        }, { setQuery: [], parameters: where.parameters });

        if (parameters.length === 1) {
            throw new Error('no valid column to set');
        }

        var sql = `UPDATE ${tableName} SET ${setQuery.join(', ')} ${where.query} RETURNING ${returningFields.join(', ')}`;

        return {
            sql,
            parameters
        };
    };
};
