import moment from 'moment';

import upsertOneQuerier from '../../queries/upsertOne';

describe('QUERY upsertOne', function () {

    it('should generate sql and parameter for upserting one entity', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, id2, fielda, fieldb)
VALUES ($id1, $id2, $fielda, $fieldb)
ON CONFLICT (id1, id2) DO UPDATE
SET fielda = $fielda, fieldb = $fieldb`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });

    it('should generate sql and parameter for upserting one entity ignoring autoincrement fields', function () {
        const upsertOneQuery = upsertOneQuerier('table', [ 'id1', 'id2' ], ['fielda', 'fieldb'], ['id2']);
        assert.deepEqual(upsertOneQuery({ id1: 1, id2: 2, fielda: 'a', fieldb: 'b' }), {
            sql: (
`INSERT INTO table (id1, fielda, fieldb)
VALUES ($id1, $fielda, $fieldb)
ON CONFLICT (id1, id2) DO UPDATE
SET fielda = $fielda, fieldb = $fieldb`
            ),
            parameters: {
                id1: 1,
                id2: 2,
                fielda: 'a',
                fieldb: 'b'
            }
        });
    });
    describe('execution', function () {
        let post, upsertOneQuery;
        const currentMonth = moment().endOf('month').startOf('day').toDate();
        const lastMonth = moment().subtract(1, 'month').endOf('month').startOf('day').toDate();

        before(function () {
            upsertOneQuery = upsertOneQuerier('post', ['author', 'date'], ['author', 'date', 'title']);
        });

        beforeEach(function* () {
            post = yield fixtureLoader.addPost({ author: 'john', date: currentMonth, title: 'title' });
        });

        it('should create unexisting entities', function* () {
            var newPost = { author: 'jane', date: lastMonth, title: 'title2' };
            yield db.query(upsertOneQuery(newPost));

            var updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id'}));
            var lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1'}))
            .map(lastTag => lastTag.id)[0];

            assert.deepEqual(updsertedPosts, [
                post,
                {
                    id: lastId,
                    ...newPost
                }
            ]);
        });

        it('should create entities when not all selector match', function* () {
            var newPost = { author: 'john', date: lastMonth, title: 'john last month' };
            yield db.query(upsertOneQuery(newPost));

            var updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id'}));
            var lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1'}))
            .map(lastTag => lastTag.id)[0];

            assert.deepEqual(updsertedPosts, [
                post,
                {
                    id: lastId,
                    ...newPost
                }
            ]);
        });

        it('should update existing entities (both selector values match)', function* () {
            var updatedPost = { author: 'john', date: currentMonth, title: 'updated title' };
            yield db.query(upsertOneQuery(updatedPost));

            var updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id'}));

            assert.deepEqual(updsertedPosts, [
                {
                    id: post.id,
                    ...updatedPost
                }
            ]);
        });

        afterEach(function* () {
            yield db.query({ sql: 'TRUNCATE post CASCADE'});
        });
    });

});
