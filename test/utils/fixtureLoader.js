'use strict';

export default function fixtureLoaderFactory(db) {

    const addAuthor = function* ({ name = 'doe', firstname = 'john' }) {
        const sql = 'INSERT INTO author (name, firstname) VALUES ($name, $firstname) RETURNING *';

        return yield (db.query({ sql, parameters: {
            name,
            firstname
        }}))[0];
    };

    const addPost = function* ({ author, title = 'My Title', date = new Date() }) {
        if (typeof author === 'object') {
            author = (yield addAuthor(author)).id;
        }
        const sql = 'INSERT INTO post (author, title, date) VALUES ($author, $title, $date) RETURNING *';

        return yield (db.query({ sql, parameters: {
            author,
            title,
            date
        }}))[0];
    };

    const addTag = function* ({ name = 'tag' }) {
        const sql = 'INSERT INTO tag (name) VALUES ($name) RETURNING *';

        return (yield db.query({sql, parameters: {
            name
        }}))[0];
    };

    return {
        addTag,
        addAuthor,
        addPost
    };
};
