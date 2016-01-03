import deleteOne from '../../queries/deleteOne';

describe('QUERY deleteOne', function () {

    it('should generate sql and parameter for selecting one entity', function () {
        const deleteOneQuery = deleteOne('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should ignore parameters not in selectors', function () {
        const deleteOneQuery = deleteOne('table', [ 'id1', 'id2' ], ['*']);
        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING *',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should be configurable', function () {
        const deleteOneQuery = deleteOne()
        .table('table')
        .idFields([ 'id1', 'id2' ])
        .returningFields(['fielda', 'fieldb']);

        assert.deepEqual(deleteOneQuery({ id1: 1, id2: 2 }), {
            sql: 'DELETE FROM table WHERE id1 = $id1 AND id2 = $id2 RETURNING fielda, fieldb',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    describe('execution', function () {
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

});
