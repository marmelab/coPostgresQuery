import selectOneQuerier from '../../queries/selectOne';

describe('QUERY selectOne', function () {

    it('should generate sql and parameter for selecting one entity', function () {
        const selectOneQuery = selectOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2 }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should ignore parameters not in selectors', function () {
        const selectOneQuery = selectOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    it('should be configurable', function () {
        const selectOneQuery = selectOneQuerier()
        .table('table')
        .selectors([ 'id1', 'id2' ])
        .returningFields(['fielda', 'fieldb']);

        assert.deepEqual(selectOneQuery({ id1: 1, id2: 2 }), {
            sql: 'SELECT fielda, fieldb FROM table WHERE id1 = $id1 AND id2 = $id2 LIMIT 1',
            parameters: {
                id1: 1,
                id2: 2
            }
        });
    });

    describe('execution', function () {
        let author;

        before(function* () {
            author = yield fixtureLoader.addAuthor({});
        });

        it('should select entity once executed', function* () {
            const selectOneQuery = selectOneQuerier('author', [ 'id' ], ['id', 'name', 'firstname']);

            const result = yield db.query(selectOneQuery({ id: author.id }));

            assert.deepEqual(result, [author]);
        });

        it('should return undefined if no autohr match once executed', function* () {
            const selectOneQuery = selectOneQuerier('author', [ 'id' ], ['name', 'firstname']);

            const result = yield db.queryOne(selectOneQuery({ id: 404 }));

            assert.deepEqual(result, undefined);
        });

        after(function* () {
            yield db.query({sql: 'TRUNCATE author CASCADE'});
        });
    });

});
