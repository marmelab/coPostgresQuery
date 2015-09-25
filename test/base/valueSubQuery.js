'use strict';

import valueSubQuery from '../../base/valueSubQuery';

describe('base/valueSubQuery', function () {

    describe('getValueSubQuery', function () {

        it('should return subQuery filtering out unwanted field', function () {
            var valueSubQueryGenerator = valueSubQuery(['id', 'login', 'first_name'], true, 'id');
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }), {
                query: '$login, $first_name',
                parameters: {
                    login: 'john',
                    first_name: 'doe'
                },
                columns: ['login', 'first_name']
            });
        });

        it('should return subQuery with given suffix', function () {
            var valueSubQueryGenerator = valueSubQuery(['id', 'login', 'first_name'], true, 'id');
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }, 2), {
                query: '$login2, $first_name2',
                parameters: {
                    login2: 'john',
                    first_name2: 'doe'
                },
                columns: ['login', 'first_name']
            });
        });

        it('should return subQuery with all passed field if whiteListed is set to true', function () {
            var valueSubQueryGenerator = valueSubQuery(['id', 'login', 'first_name'], true, 'id');
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }, null, true), {
                query: '$login, $first_name, $password',
                parameters: {
                    login: 'john',
                    first_name: 'doe',
                    password: '$ecret'
                },
                columns: ['login', 'first_name', 'password']
            });
        });

        it('should return subQuery with id field if raw is true', function () {
            var valueSubQueryGenerator = valueSubQuery(['id', 'login', 'first_name'], true, 'id');
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }, null, false, true), {
                query: '$id, $login, $first_name',
                parameters: {
                    id: 5,
                    login: 'john',
                    first_name: 'doe'
                },
                columns: ['id', 'login', 'first_name']
            });
        });
    });
});
