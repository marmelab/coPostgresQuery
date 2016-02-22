'use strict';

import batchUpdate from '../../queries/batchUpdate';

describe.only('batchUpdate', function () {
    let ids, batchUpdateQuery;

    before(function* () {
        batchUpdateQuery = batchUpdate('tag', 'temptag1', ['id', 'name'], ['id']);
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

        const result = yield db.queries(batchUpdateQuery(newTags));

        assert.deepEqual(result, newTags);

        const updatedTags = yield db.queries({ sql: 'SELECT * from tag ORDER BY id'});

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should ignore unexisting entity', function* () {
        const result = yield db.queries(batchUpdateQuery([
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: 404, name: 'newTag' }
        ]));

        assert.deepEqual(result, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' }
        ]);

        const updatedTags = yield db.queries({ sql: 'SELECT * from tag ORDER BY id'});

        assert.deepEqual(updatedTags, [
            { id: ids[0], name: 'newTag1' },
            { id: ids[1], name: 'newTag2' },
            { id: ids[2], name: 'tag3' }
        ]);
    });

    it('should update nothing on unexisting entity', function* () {
        const result = yield db.queries(batchUpdateQuery([
            { id: 4, name: 'newTag' },
            { id: 5, name: 'newTag' }
        ]));

        assert.deepEqual(result, []);

        const updatedTags = yield db.queries({ sql: 'SELECT * from tag ORDER BY id'});

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
