'use strict';

import valueSubQuery from '../../queries/valueSubQuery';

describe('base/valueSubQuery', function () {

    describe('getValueSubQuery', function () {

        it('should return subQuery filtering out unwanted field', function () {
            var valueSubQueryGenerator = valueSubQuery(['login', 'first_name']);
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }), {
                sql: '$login, $first_name',
                parameters: {
                    login: 'john',
                    first_name: 'doe'
                },
                columns: ['login', 'first_name']
            });
        });

        it('should return subQuery with given suffix', function () {
            var valueSubQueryGenerator = valueSubQuery(['login', 'first_name']);
            assert.deepEqual(valueSubQueryGenerator({ id: 5, login: 'john', first_name: 'doe', password: '$ecret' }, 2), {
                sql: '$login2, $first_name2',
                parameters: {
                    login2: 'john',
                    first_name2: 'doe'
                },
                columns: ['login', 'first_name']
            });
        });
    });
});
