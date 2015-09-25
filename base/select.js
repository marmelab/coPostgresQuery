'use strict';

module.exports = function (client, tableName, fields, idFieldName) {
    var queryAll = 'SELECT ' + fields.join(', ') + ' FROM ' + tableName;
    var queryById = queryAll + ' WHERE ' + idFieldName + ' = $id LIMIT 1';

    var selectOneById = function* selectOneById(id) {
        if (!id) {
            throw new Error('No id specified for selecting ' + tableName + ' entity.');
        }
        var result = yield client.query_(queryById, {id: id});
        var entity = result.rows[0];
        if (!entity) {
            throw new Error('not found');
        }

        return entity;
    };

    var selectAll = function* selectAll() {
        var results = yield client.query_(queryAll);

        return results.rows;
    };

    var countQuery = 'SELECT COUNT(' + idFieldName + ') FROM ' + tableName + ';';
    var countAll = function* countAll() {
        var results = yield client.query_(countQuery);

        return results.rows[0].count;
    };

    var refresh = function* refresh(entity) {
        return yield selectOneById(entity[idFieldName]);
    };

    return {
        selectOneById,
        selectAll,
        countAll,
        refresh
    };
};
