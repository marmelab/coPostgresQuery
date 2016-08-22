import { batchDelete } from '../../lib/';

describe('batchDelete', () => {
    let ids;
    let tags;
    let batchDeleteQuery;

    before(() => {
        batchDeleteQuery = batchDelete('tag', ['id', 'name'], 'id')(db);
    });

    beforeEach(function* () {
        tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
        ].map(fixtureLoader.addTag);
        ids = tags.map(tag => tag.id);
    });

    it('should remove entities', function* () {
        const result = yield batchDeleteQuery(ids.slice(1));

        assert.deepEqual(result, tags.slice(1));

        const remainingTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual(remainingTags, tags.slice(0, 1));
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
