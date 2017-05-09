import { deleteOneQuery } from '../../lib';

describe('deleteOne', () => {
    let author;
    let deleteOne;

    before(() => {
        deleteOne = db.link(deleteOneQuery({ table: 'author', idFields: ['id'] }));
    });

    beforeEach(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should delete entity once executed', function* () {
        const result = yield deleteOne({ id: author.id });

        assert.deepEqual(result, author);

        assert.isUndefined(yield db.queryOne({
            sql: 'SELECT * FROM author WHERE id = $id',
            parameters: { id: author.id },
        }));
    });

    it('should return undefined if no author match once executed', function* () {
        const result = yield deleteOne({ id: 404 });

        assert.isUndefined(result);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE author CASCADE' });
    });
});
