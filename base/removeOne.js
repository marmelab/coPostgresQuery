'use strict';

module.exports = function (client, tableName, fields, idFieldName, version) {
    return function* removeOne(id) {
        if (!id) {
            throw new Error('No id specified for deleting ' + tableName + ' entity.');
        }

        if (version) {
            yield version({ id: id }, 'delete', true);
        }

        var query = 'DELETE FROM ' + tableName + ' WHERE ' + idFieldName + ' = $id RETURNING ' + fields.join(', ');
        var entity = yield client.query(query, { id: id })[0];
        if (!entity) {
            throw new Error('not found');
        }

        return entity;
    };
};
