import { deleteOne } from '../../lib';

describe('deleteOne', function () {
    let author, deleteOneQuery;

    before(function () {
        deleteOneQuery = deleteOne('author', [ 'id' ])(db);
    });

    beforeEach(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should delete entity once executed', function* () {
        const result = yield deleteOneQuery({ id: author.id });

        assert.deepEqual(result, author);

        assert.isUndefined(yield db.queryOne({ sql: 'SELECT * FROM author WHERE id = $id', parameters: { id: author.id } }));
    });

    it('should return undefined if no author match once executed', function* () {
        const result = yield deleteOneQuery({ id: 404 });

        assert.isUndefined(result);
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE author CASCADE'});
    });
});
