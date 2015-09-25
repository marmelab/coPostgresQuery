'use strict';

import batchUpdate from '../../base/batchUpdate';

describe('batchUpdate', function () {
    var ids, batchUpdateQuery;

    before(function* () {
        batchUpdateQuery = batchUpdate(db.client, 'tag', ['id', 'name'], 'id', true);
    });

    beforeEach(function* () {
        var tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ].map(fixtureLoader.addTag);

        ids = tags.map(tag => tag.id);
    });

    it('should update array of entities in a single request', function* () {
        var newTags = [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' }
        ];

        var result = yield batchUpdateQuery(newTags);

        assert.deepEqual(result, newTags);

        var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should ignore unexisting entity', function* () {
        var result = yield batchUpdateQuery([
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: 404, name: 'newTag' }
        ]);

        assert.deepEqual(result, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' }
        ]);

        var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should update nothing on unexisting entity', function* () {
        var result = yield batchUpdateQuery([
            { id: 4, name: 'newTag' },
            { id: 5, name: 'newTag' }
        ]);

        assert.deepEqual(result, []);

        var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'tag1' },
            { id: ids[1], name: 'tag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    afterEach(function* () {
        yield db.client.query_('TRUNCATE tag CASCADE');
    });
});
