'use strict';

function parametersGetter(identifiers) {
    if (!Array.isArray(identifiers)) {
        return (id) => ({ id });
    }

    return (id) => (id);
};

export default function (table, identifiers, returningFields = ['*']) {
    let getParameters = parametersGetter(identifiers);
    if (!Array.isArray(identifiers)) {
        identifiers = [identifiers];
    }

    return function removeOne(id) {
        if (!id) {
            throw new Error(`No id specified for deleting ${table} entity.`);
        }
        const whereQuery = identifiers.map((field) => `${table}.${field} = $${field}`);
        const sql = `DELETE FROM ${table} WHERE ${whereQuery.join(' AND ')} RETURNING ${returningFields.join(', ')}`;
        const parameters = getParameters(id);

        return {sql, parameters};
    };

};
