import { batchRemove } from '../../lib/';

describe('batchRemove', () => {
    let ids;
    let tags;
    let dbBatchRemove;

    before(() => {
        dbBatchRemove = db.link(batchRemove({
            table: 'tag',
            returnCols: ['id', 'name'],
            primaryKey: 'id',
        }));
    });

    beforeEach(function* () {
        tags = yield [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
        ].map(fixtureLoader.addTag);
        ids = tags.map(tag => tag.id);
    });

    it('should remove rows', function* () {
        const result = yield dbBatchRemove(ids.slice(1));

        assert.deepEqual(result, tags.slice(1));

        const remainingTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual(remainingTags, tags.slice(0, 1));
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
