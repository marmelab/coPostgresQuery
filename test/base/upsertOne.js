'use strict';

var upsertOne = require('../../base/upsertOne');
var moment = require('moment');

describe('upsertOne', function () {
    var upsertOneQuery;

    describe('with autoincrement key', function () {
        let tag;

        before(function* () {
            upsertOneQuery = upsertOne('tag', ['name'], ['name'], ['id'], ['id', 'name'])(db);
        });

        beforeEach(function* () {
            tag = yield fixtureLoader.addTag({ name: 'tag' });
        });

        it('should create unexisting entities', function* () {
            var newTag = { name: 'newTag'};

            yield upsertOneQuery(newTag);

            var updsertedTags = (yield db.query({ sql: 'SELECT * from tag ORDER BY id'}));
            var lastId = (yield db.query({ sql: 'SELECT id FROM tag ORDER BY id DESC LIMIT 1'}))
            .map(lastTag => lastTag.id)[0];

            assert.deepEqual(updsertedTags, [
                { id: tag.id, name: 'tag' },
                { id: lastId, name: 'newTag' }
            ]);
        });

        afterEach(function* () {
            yield db.query({ sql: 'TRUNCATE tag CASCADE'});
        });
    });

    describe('with multiple key (date and author)', function (argument) {
        const currentMonth = moment().endOf('month').startOf('day').toDate();
        let authors;

        before(function* () {
            upsertOneQuery = upsertOne('post', ['author', 'date'], ['title'], undefined, ['author', 'date', 'title'])(db);

            authors = yield [
                { name: 'doe', firstname: 'john'},
                { name: 'dee', firstname: 'jane'}
            ].map(fixtureLoader.addAuthor);
        });

        beforeEach(function* () {
            yield fixtureLoader.addPost({ author: authors[0].id, date: currentMonth, title: '1 vs 1' });
        });

        it('should update entity with corresponding primaryKeys if it exists', function* () {
            var newPost = { author: authors[0].id, date: currentMonth, title: '1 vs 100' };

            const updatedPost = yield upsertOneQuery(newPost);

            assert.deepEqual(updatedPost,
                { author: authors[0].id, date: currentMonth, title: '1 vs 100' }
            );
        });

        it('should create unexisting entities', function* () {
            var newPost = { author: authors[1].id, date: currentMonth, title: '2 much' };

            const updatedPost = yield upsertOneQuery(newPost);
            assert.deepEqual(updatedPost, { author: authors[1].id, date: currentMonth, title: '2 much' });

            const updatedPosts = (yield db.query({ sql: 'SELECT author, date, title from post ORDER BY id'}));
            assert.deepEqual(updatedPosts, [
                { author: authors[0].id, date: currentMonth, title: '1 vs 1' },
                { author: authors[1].id, date: currentMonth, title: '2 much' }
            ]);
        });

        afterEach(function* () {
            yield db.query({ sql: 'TRUNCATE post CASCADE'});
        });

        after(function* () {
            yield db.query({ sql: 'TRUNCATE author CASCADE'});
        });
    });

});
