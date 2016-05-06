import { batchInsert } from '../../lib';

describe('batchInsert', function () {
    let batchInsertQuery;

    beforeEach(function () {
        batchInsertQuery = batchInsert('tag', ['name'])(db);
    });

    it('should throw an error if no entities given', function* () {
        let error;
        try {
            yield batchInsertQuery();
        } catch (e) {
            error = e;
        }

        assert.equal(error.message, 'No data for batch inserting tag entities.');
    });

    it('should throw an error if passed an empty array', function* () {
        let error;
        try {
            yield batchInsertQuery([]);
        } catch (e) {
            error = e;
        }

        assert.equal(error.message, 'No data for batch inserting tag entities.');
    });

    it('should insert list of entity in a single request returning all field by default', function* () {
        const tags = [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ];
        const result = yield batchInsertQuery(tags);

        assert.deepEqual(result.map((tag) => ({ name: tag.name })), tags);

        var savedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual(result, savedTags);
    });

    it('should insert list of entity in a single request returning only specified field if given', function* () {
        batchInsertQuery = batchInsert('tag', ['name'], ['id'])(db);
        const tags = [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' }
        ];
        const result = yield batchInsertQuery(tags);

        assert.equal(result.length, tags.length);

        const savedNames = yield db.query({ sql: 'SELECT name from tag ORDER BY id' });
        assert.deepEqual(savedNames, tags);
        const savedIds = yield db.query({ sql: 'SELECT id from tag ORDER BY id' });
        assert.deepEqual(savedIds, result);
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE tag CASCADE'});
    });
});
