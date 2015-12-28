import configurable from '../utils/configurable';
import whereQuery from './whereQuery';

export default function (table, identifiers = ['id'], fields, returningFields = ['*']) {
    let config = {
        table,
        identifiers: Array.isArray(identifiers) ? identifiers : [identifiers],
        fields,
        returningFields
    };

    function updateOne(id, data) {
        const {
            table,
            identifiers,
            fields,
            returningFields
        } = config;

        if (!id) {
            throw new Error(`No id specified for updating ${table} entity.`);
        }
        id = Object.prototype.toString.call(id) === '[object Object]' ? id : {[identifiers[0]]: id};

        if (Object.keys(id).length !== identifiers.length || Object.keys(id).some((key) => identifiers.indexOf(key) === -1)) {
            throw new Error(`Given ids: (${Object.keys(id).join(', ')}) does not match identifiers: (${identifiers.join(', ')})`);
        }

        const where = whereQuery(id, identifiers);

        const { setQuery, parameters } = fields.reduce((result, field) => {
            if (identifiers.indexOf(field) !== -1 || typeof data[field] === 'undefined') {
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

        var sql = `UPDATE ${table} SET ${setQuery.join(', ')} ${where.sql} RETURNING ${returningFields.join(', ')}`;

        return {
            sql,
            parameters
        };
    };

    return configurable(updateOne, config);
};
