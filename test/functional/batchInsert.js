import { batchInsert as batchInsertQuery } from '../../lib';

describe('batchInsert', () => {
    let batchInsert;

    beforeEach(() => {
        batchInsert = db.link(batchInsertQuery({ table: 'tag', writableFields: ['name'] }));
    });

    it('should do nothing if no rows given', function* () {
        const result = yield batchInsert();

        assert.deepEqual(result, []);
    });

    it('should do nothing if passed an empty array', function* () {
        const result = yield batchInsert([]);

        assert.deepEqual(result, []);
    });

    it('should insert list of row in a single request returning all field by default',
    function* () {
        const tags = [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
        ];
        const result = yield batchInsert(tags);

        assert.deepEqual(result.map((tag) => ({ name: tag.name })), tags);

        const savedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });

        assert.deepEqual(result, savedTags);
    });

    it('should insert list of row in a single request returning only specified field if given',
    function* () {
        batchInsert = db.link(batchInsertQuery({ table: 'tag', writableFields: ['name'], returnFields: ['id'] }));
        const tags = [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
        ];
        const result = yield batchInsert(tags);

        assert.equal(result.length, tags.length);

        const savedNames = yield db.query({ sql: 'SELECT name from tag ORDER BY id' });
        assert.deepEqual(savedNames, tags);
        const savedIds = yield db.query({ sql: 'SELECT id from tag ORDER BY id' });
        assert.deepEqual(savedIds, result);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
