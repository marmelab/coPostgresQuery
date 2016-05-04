import deleteOne from '../../lib/queries/deleteOne';

describe('deleteOne', function () {
    let author;

    beforeEach(function* () {
        author = yield fixtureLoader.addAuthor({});
    });

    it('should delete entity once executed', function* () {
        const deleteOneQuery = deleteOne('author', [ 'id' ]);

        const result = yield db.query(deleteOneQuery({ id: author.id }));

        assert.deepEqual(result, [author]);

        assert.isUndefined(yield db.queryOne({ sql: 'SELECT * FROM author WHERE id = $id', parameters: { id: author.id } }));
    });

    it('should return undefined if no author match once executed', function* () {
        const deleteOneQuery = deleteOne('author', [ 'id' ]);

        const result = yield db.queryOne(deleteOneQuery({ id: 404 }));

        assert.isUndefined(result);
    });

    afterEach(function* () {
        yield db.query({sql: 'TRUNCATE author CASCADE'});
    });
});
