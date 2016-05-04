import batchDelete from '../../lib/queries/batchDelete';

describe('batchDelete', function () {
    let ids, tags, batchDeleteQuery;

    before(function () {
        batchDeleteQuery = batchDelete('tag', ['id', 'name'], 'id');
    });

    beforeEach(function* () {
        tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ].map(fixtureLoader.addTag);
        ids = tags.map(tag => tag.id);
    });

    it('should remove entities', function* () {
        var result = yield db.query(batchDeleteQuery(ids.slice(1)));

        assert.deepEqual(result, tags.slice(1));

        var remainingTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual(remainingTags, tags.slice(0, 1));
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE tag CASCADE'});
    });
});
