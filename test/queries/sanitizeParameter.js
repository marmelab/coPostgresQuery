import sanitizeParameter from '../../lib/queries/sanitizeParameter';

describe.only('sanitizeParameter', function () {
    it('should keep only attributes passed in first argument', function () {
        const fields = ['name', 'firstname', 'mail'];
        const object = { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com', password: 'secret', like_password: '*', from_date: '2016-01-01', to_date: '2020-12-12' };

        assert.deepEqual(sanitizeParameter(fields, object), { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com' });
    });

    it('should keep from_ attributes matching one first argument', function () {
        const fields = ['name', 'firstname', 'mail', 'date'];
        const object = { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com', from_date: '2012-12-12' };

        assert.deepEqual(sanitizeParameter(fields, object), { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com', from_date: '2012-12-12' });
    });

    it('should keep to_ attributes matching one first argument', function () {
        const fields = ['name', 'firstname', 'mail', 'date'];
        const object = { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com', to_date: '2020-12-12'};

        assert.deepEqual(sanitizeParameter(fields, object), { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com', to_date: '2020-12-12' });
    });

    it('should keep like_ attributes matching one first argument', function () {
        const fields = ['name', 'firstname', 'mail'];
        const object = { like_name: 'do', firstname: 'john', mail: 'john.doe@mail.com' };

        assert.deepEqual(sanitizeParameter(fields, object), { like_name: 'do', firstname: 'john', mail: 'john.doe@mail.com' });
    });

    it('should not include attributes not in object if there is no default for them', function () {
        const fields = ['name', 'firstname', 'mail'];
        const object = { name: 'doe', firstname: 'john'};

        assert.deepEqual(sanitizeParameter(fields, object), { name: 'doe', firstname: 'john' });
    });

    it('should return an empty object if fields is empty', function () {
        const fields = [];
        const object = { name: 'doe', firstname: 'john'};

        assert.deepEqual(sanitizeParameter(fields, object), {});
    });

    it('should return default object if receiving an empty object', function () {
        const fields = { name: 'doe', firstname: 'john', mail: 'john.doe@mail.com'};
        const object = {};

        assert.deepEqual(sanitizeParameter(fields, object), fields);
    });

    it('should return empty object if receiving an empty object and no default is specified', function () {
        const fields = ['name', 'firstname', 'mail'];
        const object = {};

        assert.deepEqual(sanitizeParameter(fields, object), {});
    });

    it('should accept null parameter', function () {
        const fields = ['name', 'firstname'];
        const object = { name: 'doe', firstname: null};

        assert.deepEqual(sanitizeParameter(fields, object), { name: 'doe', firstname: null });
    });

    it('should add match parameter if there is at least one field', function () {
        const fields = ['name'];
        const object = { match: 'doe'};

        assert.deepEqual(sanitizeParameter(fields, object), { match: '%doe%' });
    });
});
