'use strict';

import batchUpdate from '../../base/batchUpdate';

describe('batchUpdate', function () {
    let ids, batchUpdateQuery;

    before(function* () {
        batchUpdateQuery = batchUpdate('tag', ['id', 'name'], ['id'])(db);
    });

    beforeEach(function* () {
        const tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ].map(fixtureLoader.addTag);

        ids = tags.map(tag => tag.id);
    });

    it('should update array of entities in a single request', function* () {
        const newTags = [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' }
        ];

        const result = yield batchUpdateQuery(newTags);

        assert.deepEqual(result, newTags);

        const updatedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id'});

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should ignore unexisting entity', function* () {
        const result = yield batchUpdateQuery([
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: 404, name: 'newTag' }
        ]);

        assert.deepEqual(result, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' }
        ]);

        const updatedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id'});

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should update nothing on unexisting entity', function* () {
        const result = yield batchUpdateQuery([
            { id: 4, name: 'newTag' },
            { id: 5, name: 'newTag' }
        ]);

        assert.deepEqual(result, []);

        const updatedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id'});

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'tag1' },
            { id: ids[1], name: 'tag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE'});
    });
});
