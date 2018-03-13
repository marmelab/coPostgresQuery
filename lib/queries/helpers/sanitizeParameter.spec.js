import { assert } from 'chai';
import sanitizeParameter from './sanitizeParameter';

describe('sanitizeParameter', () => {
    it('should keep only attributes passed in first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
            password: 'secret',
            like_password: '*',
            from_date: '2016-01-01',
            to_date: '2020-12-12',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
        });
    });

    it('should keep from_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail', 'date'];
        const object = {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
            from_date: '2012-12-12',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
            from_date: '2012-12-12',
        });
    });

    it('should keep to_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail', 'date'];
        const object = {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
            to_date: '2020-12-12',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            name: 'doe',
            firstname: 'john',
            mail: 'john.doe@mail.com',
            to_date: '2020-12-12',
        });
    });

    it('should keep like_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            like_name: 'do',
            firstname: 'john',
            mail: 'john.doe@mail.com',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            like_name: '%do%',
            firstname: 'john',
            mail: 'john.doe@mail.com',
        });
    });

    it('should keep not_like_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            not_like_name: 'do',
            firstname: 'john',
            mail: 'john.doe@mail.com',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            not_like_name: '%do%',
            firstname: 'john',
            mail: 'john.doe@mail.com',
        });
    });

    it('should keep not_ attributes matching one argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            not_name: ['do', 'dupont'],
            firstname: 'john',
            mail: 'john.doe@mail.com',
        };

        assert.deepEqual(sanitizeParameter(columns, object), {
            not_name: ['do', 'dupont'],
            firstname: 'john',
            mail: 'john.doe@mail.com',
        });
    });

    it('should not include attributes not in object if there is no default for them', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = { name: 'doe', firstname: 'john' };

        assert.deepEqual(sanitizeParameter(columns, object), { name: 'doe', firstname: 'john' });
    });

    it('should replace "." by "__"', () => {
        const columns = ['user.name', 'user.firstname'];
        const object = { 'user.name': 'doe', 'user.firstname': 'john' };

        assert.deepEqual(sanitizeParameter(columns, object), {
            user__name: 'doe',
            user__firstname: 'john',
        });
    });

    it('should return an empty object if columns is empty', () => {
        const columns = [];
        const object = { name: 'doe', firstname: 'john' };

        assert.deepEqual(sanitizeParameter(columns, object), {});
    });

    it('should return default object if receiving an empty object', () => {
        const columns = { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com' };
        const object = {};

        assert.deepEqual(sanitizeParameter(columns, object), columns);
    });

    it('should return empty object if receiving an empty object and no default is specified',
    () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {};

        assert.deepEqual(sanitizeParameter(columns, object), {});
    });

    it('should accept null parameter', () => {
        const columns = ['name', 'firstname'];
        const object = { name: 'doe', firstname: null };

        assert.deepEqual(sanitizeParameter(columns, object), { name: 'doe', firstname: null });
    });

    it('should add match parameter if there is at least one column', () => {
        const columns = ['name'];
        const object = { match: 'doe' };

        assert.deepEqual(sanitizeParameter(columns, object), { match: '%doe%' });
    });
});
