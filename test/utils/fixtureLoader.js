'use strict';

export default function fixtureLoaderFactory(client) {

    const addAuthor = function* ({ name = 'doe', firstname = 'john' }) {
        const query = 'INSERT INTO author (name, firstname) VALUES ($name, $firstname) RETURNING *';

        return (yield db.client.query_(query, {
            name,
            firstname
        })).rows[0];
    };

    const addPost = function* ({ author, title = 'My Title', date = new Date() }) {
        if (typeof author === 'object') {
            author = (yield addAuthor(author)).id;
        }
        const query = 'INSERT INTO post (author, title, date) VALUES ($author, $title, $date) RETURNING *';

        return (yield db.client.query_(query, {
            author,
            title,
            date
        })).rows[0];
    };

    const addTag = function* ({ name = 'tag' }) {
        const query = 'INSERT INTO tag (name) VALUES ($name) RETURNING *';

        return (yield db.client.query_(query, {
            name
        })).rows[0];
    };

    return {
        addTag,
        addAuthor,
        addPost
    };
};
