import moment from 'moment';

import { upsertOne } from '../../lib';

describe('execution', () => {
    let post;
    let upsertOneQuery;
    const currentMonth = moment().endOf('month').startOf('day')
    .toDate();
    const lastMonth = moment().subtract(1, 'month').endOf('month')
    .startOf('day')
    .toDate();

    before(() => {
        upsertOneQuery = upsertOne('post', ['author', 'date'], ['author', 'date', 'title'])(db);
    });

    beforeEach(function* () {
        post = yield fixtureLoader.addPost({ author: 'john', date: currentMonth, title: 'title' });
    });

    it('should create unexisting entities', function* () {
        const newPost = { author: 'jane', date: lastMonth, title: 'title2' };
        yield upsertOneQuery(newPost);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));
        const lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1' }))
        .map(lastTag => lastTag.id)[0];

        assert.deepEqual(updsertedPosts, [
            post,
            {
                id: lastId,
                ...newPost,
            },
        ]);
    });

    it('should create entities when not all selector match', function* () {
        const newPost = { author: 'john', date: lastMonth, title: 'john last month' };
        const result = yield upsertOneQuery(newPost);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));
        const lastId = (yield db.query({ sql: 'SELECT id FROM post ORDER BY id DESC LIMIT 1' }))
        .map(lastTag => lastTag.id)[0];

        assert.deepEqual(result, {
            id: lastId,
            ...newPost,
        });

        assert.deepEqual(updsertedPosts, [
            post,
            {
                id: lastId,
                ...newPost,
            },
        ]);
    });

    it('should update existing entities (both selector values match)', function* () {
        const updatedPost = { author: 'john', date: currentMonth, title: 'updated title' };
        const result = yield upsertOneQuery(updatedPost);
        assert.deepEqual(result, {
            id: post.id,
            ...updatedPost,
        });

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));

        assert.deepEqual(updsertedPosts, [
            {
                id: post.id,
                ...updatedPost,
            },
        ]);
    });

    it('should update nothing when selector match but no update value are provided', function* () {
        const updatedPost = { author: 'john', date: currentMonth };
        const result = yield upsertOneQuery(updatedPost);
        assert.deepEqual(result, post);

        const updsertedPosts = (yield db.query({ sql: 'SELECT * from post ORDER BY id' }));

        assert.deepEqual(updsertedPosts, [post]);
    });

    afterEach(function* () {
        yield db.query({ sql: 'TRUNCATE post CASCADE' });
    });
});
