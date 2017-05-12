import { insertOne as insertOneQuery } from '../../lib';

describe('insertOne', () => {
    it('should insert row returning all column by default', function* () {
        const insertOne = db.link(insertOneQuery({ table: 'tag', writableCols: ['name'] }));
        const result = yield insertOne({ name: 'tag1' });
        assert.deepEqual(result.name, 'tag1');

        const savedTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
        assert.deepEqual([result], savedTags);
    });

    it('should insert row returning only specified column if given', function* () {
        const insertOne = db.link(insertOneQuery({ table: 'tag', writableCols: ['name'], returnCols: ['id'] }));

        const result = yield insertOne({ name: 'tag1' });

        const savedNames = yield db.query({ sql: 'SELECT name from tag ORDER BY id' });
        assert.deepEqual(savedNames, [{ name: 'tag1' }]);
        const savedIds = yield db.query({ sql: 'SELECT id from tag ORDER BY id' });
        assert.deepEqual([result], savedIds);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE tag CASCADE' });
    });
});
