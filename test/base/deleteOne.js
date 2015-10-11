'use strict';

import deleteOne from '../../base/deleteOne';
import moment from 'moment';

describe.only('deleteOne', function () {
    var deleteOneQuery;

    describe('with simple id', function () {
        let tags, ids;
        before(function* () {
            deleteOneQuery = deleteOne('tag', 'id')(db);
        });

        beforeEach(function* () {
            tags = yield [
                { name: 'tag1' },
                { name: 'tag2' },
                { name: 'tag3' }
            ].map(fixtureLoader.addTag);
            ids = tags.map(tag => tag.id);
        });

        it('should remove one entity and return it', function* () {
            var result = yield deleteOneQuery(ids.slice(-1)[0]);

            assert.deepEqual(result, tags.slice(-1)[0]);

            var remainingTags = yield db.query({ sql: 'SELECT * from tag ORDER BY id' });
            assert.deepEqual(remainingTags, tags.slice(0, -1));
        });

        afterEach(function* () {
            yield db.query({sql: 'TRUNCATE tag CASCADE'});
        });
    });

    describe('with complex id', function () {
        let posts;
        const yesterday = moment().subtract(1, 'days').toDate();
        const today = moment().toDate();

        before(function* () {
            deleteOneQuery = deleteOne('post', ['author', 'date'])(db);
        });

        beforeEach(function* () {
            posts = yield [
                { author: 'john', date: yesterday, title: '1' },
                { author: 'joe', date: today, title: '2' },
                { author: 'jane', date: yesterday, title: '3' }
            ].map(fixtureLoader.addPost);
        });

        it('should remove one entity and return it', function* () {
            var result = yield deleteOneQuery({ author: 'john', date: yesterday});

            assert.deepEqual(result, posts[0]);

            var remainingTags = yield db.query({ sql: 'SELECT * from post ORDER BY id' });
            assert.deepEqual(remainingTags, posts.slice(1));
        });

        it('should throw an error if tryng to delete unexisting entity', function* () {
            let error;
            try {
                yield deleteOneQuery({ author: 'john', date: today});
            } catch (e) {
                error = e;
            }

            assert.equal(error.message, 'not found');
        });

        afterEach(function* () {
            yield db.query({sql: 'TRUNCATE post CASCADE'});
        });
    });
});
