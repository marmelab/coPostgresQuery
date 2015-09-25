'use strict';

import batchDelete from '../../base/batchDelete';

describe('batchDelete', function () {
    var ids, tags, batchDeleteQuery;

    before(function* () {
        batchDeleteQuery = batchDelete(db.client, 'tag', ['id', 'name'], 'id');
    });

    beforeEach(function* () {
        tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ].map(fixtureLoader.addTag);

        ids = tags.map(tag => tag.id);
    });

    it('should remove entity and return them', function* () {
        var result = yield batchDeleteQuery(ids.slice(1));

        assert.deepEqual(result, tags.slice(1));

        var remainingTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;
        assert.deepEqual(remainingTags, tags.slice(0, 1));
    });

    afterEach(function* () {
        yield db.client.query_('TRUNCATE tag CASCADE');
    });
});
