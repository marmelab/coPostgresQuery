'use strict';

var upsertOne = require('../../base/upsertOne');
var moment = require('moment');

describe('upsertOne', function () {
    var upsertOneQuery;

    describe('with autoincrement key', function () {
        let tag;

        before(function* () {
            upsertOneQuery = upsertOne(db.client, 'tag', ['id'], ['name'], 'id', ['id', 'name']);
        });

        beforeEach(function* () {
            tag = yield fixtureLoader.addTag({ name: 'tag' });
        });

        it('should update entity if it exists', function* () {
            var newTag = { id: tag.id, name: 'renamedTag1' };

            yield upsertOneQuery(newTag);

            var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;

            assert.deepEqual(updatedTags, [
                { id: tag.id, name: 'renamedTag1' }
            ]);
        });

        it('should create unexisting entities', function* () {
            var newTag = { name: 'newTag'};

            yield upsertOneQuery(newTag);

            var updatedTags = (yield db.client.query_('SELECT * from tag ORDER BY id')).rows;
            var lastId = (yield db.client.query_('SELECT id FROM tag ORDER BY id DESC LIMIT 1'))
            .rows.map(lastTag => lastTag.id)[0];

            assert.deepEqual(updatedTags, [
                { id: tag.id, name: 'tag' },
                { id: lastId, name: 'newTag' }
            ]);
        });

        afterEach(function* () {
            yield db.client.query_('TRUNCATE tag CASCADE');
        });
    });

    describe('with multiple key (date and author)', function (argument) {
        const currentMonth = moment().endOf('month').startOf('day').toDate();
        let authors;
        before(function* () {
            upsertOneQuery = upsertOne(db.client, 'post', ['author', 'date'], ['title'], null, ['author', 'date', 'title']);

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

            yield upsertOneQuery(newPost);

            var updatedPost = (yield db.client.query_('SELECT author, date, title from post ORDER BY id')).rows;

            assert.deepEqual(updatedPost, [
                { author: authors[0].id, date: currentMonth, title: '1 vs 100' }
            ]);
        });

        it('should create unexisting entities', function* () {
            var newPost = { author: authors[1].id, date: currentMonth, title: '2 much' };

            yield upsertOneQuery(newPost);

            var updatedPost = (yield db.client.query_('SELECT author, date, title from post ORDER BY id')).rows;

            assert.deepEqual(updatedPost, [
                { author: authors[0].id, date: currentMonth, title: '1 vs 1' },
                { author: authors[1].id, date: currentMonth, title: '2 much' }
            ]);
        });

        afterEach(function* () {
            yield db.client.query_('TRUNCATE post CASCADE');
        });

        after(function* () {
            yield db.client.query_('TRUNCATE author CASCADE');
        });
    });

});
