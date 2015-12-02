'use strict';

import * as whereQueryGet from '../../queries/whereQuery';
import whereQuery, { sortQueryType, getFieldType } from '../../queries/whereQuery';

describe.only('whereQuery', function () {

    it('should return whereQuery', function () {
        assert.deepEqual(whereQuery({
            field1: 1,
            to_field2: new Date(500),
            from_field3: new Date(800),
            match: 6,
            field4: 'ignored'
        }, ['field1', 'field2', 'field3']), {
            parameters: {
                field1: 1,
                to_field2: new Date(500),
                from_field3: new Date(800),
                match: '%6%'
            },
            query: 'WHERE (field1::text ILIKE $match OR field2::text ILIKE $match OR field3::text ILIKE $match) AND field3::timestamp >= $from_field3::timestamp AND field2::timestamp <= $to_field2::timestamp AND field1 = $field1'
        });
    });

    describe('getFieldType', function () {

        it('should return query, if field is in searchableField', function () {
            assert.equal(getFieldType('field', ['field']), 'query');
        });

        it('should return match, if field is match and searchableFields contain at least one element', function () {
            assert.equal(getFieldType('match', ['field']), 'match');
        });

        it('should return discarded if field is match but searchableFields is empty', function () {
            assert.equal(getFieldType('match', []), 'discarded');
        });

        it('should return discarded if field is not in searchableFields', function () {
            assert.equal(getFieldType('needle', ['haystack']), 'discarded');
        });

        it('should return to if field is suffixed by to and is in searchableFields', function () {
            assert.equal(getFieldType('to_field', ['field']), 'to');
        });

        it('should return discarded if field is suffixed by to but is not in searchableFields', function () {
            assert.equal(getFieldType('to_field', ['other_field']), 'discarded');
        });

        it('should return from if field is suffixed by from and is in searchableFields', function () {
            assert.equal(getFieldType('from_field', ['field']), 'from');
        });

        it('should return discarded if field is suffixed by from but is not in searchableFields', function () {
            assert.equal(getFieldType('from_field', ['other_field']), 'discarded');
        });
    });

    describe('sortQueryType', function () {
        it('should regroup query by their type', function () {
            assert.deepEqual(sortQueryType({
                field1: 1,
                to_field2: 2,
                from_field3: 3,
                match: 4,
                field4: 5
            }, ['field1', 'field2', 'field3']), {
                query: {
                    field1: 1
                },
                to: {
                    to_field2: 2
                },
                from: {
                    from_field3: 3
                },
                match: {
                    match: 4
                },
                discarded: {
                    field4: 5
                }
            });
        });
    });

    describe('getMatch', function () {
        it('should return query and parameter to match a given value if match filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({ match: 'needle' }, ['field1', 'field2', 'field3']);

            assert.deepEqual(whereParts, [ '(field1::text ILIKE $match OR field2::text ILIKE $match OR field3::text ILIKE $match)' ]);
            assert.deepEqual(parameters, { match: '%needle%' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({ match: 'needle' }, ['field1', 'field2'], {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', '(field1::text ILIKE $match OR field2::text ILIKE $match)' ]);
            assert.deepEqual(parameters, { field1: 'haystack', match: '%needle%' });
        });

        it('should return passed result if there is no searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({ match: 'needle' }, [], {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });
    });

    describe('getFrom', function () {
        it('should return query and parameter to test for date after field value if given field starting with from_', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({ from_date: 'date' }, ['field', 'date']);

            assert.deepEqual(whereParts, [ 'date::timestamp >= $from_date::timestamp' ]);
            assert.deepEqual(parameters, { from_date: 'date' });
        });

        it('should work with several field starting with from_', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({ from_date: 'date1', from_birth: 'date2' }, ['field', 'date', 'birth']);

            assert.deepEqual(whereParts, [
                'date::timestamp >= $from_date::timestamp',
                'birth::timestamp >= $from_birth::timestamp'
            ]);
            assert.deepEqual(parameters, { from_date: 'date1', from_birth: 'date2' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({ from_date: 'date' }, ['field', 'date'], {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp >= $from_date::timestamp' ]);
            assert.deepEqual(parameters, { field1: 'haystack', from_date: 'date' });
        });
    });

    describe('getTo', function () {
        it('should return query and parameter to test for date after field value if given field starting with to_', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({ to_date: 'date' }, ['field', 'date']);

            assert.deepEqual(whereParts, [ 'date::timestamp <= $to_date::timestamp' ]);
            assert.deepEqual(parameters, { to_date: 'date' });
        });

        it('should work with several field starting with to_', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({ to_date: 'date1', to_birth: 'date2' }, ['field', 'date', 'birth']);

            assert.deepEqual(whereParts, [
                'date::timestamp <= $to_date::timestamp',
                'birth::timestamp <= $to_birth::timestamp'
            ]);
            assert.deepEqual(parameters, { to_date: 'date1', to_birth: 'date2' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({ to_date: 'date' }, ['field', 'date'], {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp <= $to_date::timestamp' ]);
            assert.deepEqual(parameters, { field1: 'haystack', to_date: 'date' });
        });
    });

    describe('getQuery', function () {
        it('should return query and parameter for parameter in searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({ field1: 1, field2: 2, field3: 3 }, ['field1', 'field2', 'field3']);

            assert.deepEqual(whereParts, [
                'field1 = $field1',
                'field2 = $field2',
                'field3 = $field3'
            ]);
            assert.deepEqual(parameters, {
                field1: 1,
                field2: 2,
                field3: 3
            });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({ field1: 1 }, ['field1', 'other'], {
                whereParts: ['field2 = $field2'],
                parameters: { field2: 2}
            });

            assert.deepEqual(whereParts, [ 'field2 = $field2', 'field1 = $field1' ]);
            assert.deepEqual(parameters, { field1: 1, field2: 2 });
        });

        it('should return passed result if no filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({}, ['field1', 'field2', 'field3'], {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });
    });

});
