import configurable from '../utils/configurable';

function parametersGetter(identifiers) {
    if (!Array.isArray(identifiers)) {
        return (id) => ({ id });
    }

    return (id) => (id);
};

export default function (table, identifiers, fields = ['*']) {
    let config = {
        table,
        identifiers: Array.isArray(identifiers) ? identifiers : [identifiers],
        fields
    };

    function deleteOne(id) {
        const {
            table,
            identifiers,
            fields
        } = config;
        const getParameters = parametersGetter(identifiers);
        if (!id) {
            throw new Error(`No id specified for deleting ${table} entity.`);
        }
        const whereQuery = identifiers.map((field) => `${table}.${field} = $${field}`);
        const sql = `DELETE FROM ${table} WHERE ${whereQuery.join(' AND ')} RETURNING ${fields.join(', ')}`;
        const parameters = getParameters(id);

        return {sql, parameters};
    };

    return configurable(deleteOne, config);
};
