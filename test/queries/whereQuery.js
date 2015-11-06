'use strict';

import * as whereQueryGet from '../../queries/whereQuery';

describe.only('whereQuery', function () {

    describe('getMatch', function () {
        it('should return query and parameter to match a given value if match filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { match: 'needle' },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, [ '(field1::text ILIKE $match OR field2::text ILIKE $match OR field3::text ILIKE $match)' ]);
            assert.deepEqual(parameters, { match: '%needle%' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { match: 'needle' },
                searchableFields: ['field1', 'field2']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', '(field1::text ILIKE $match OR field2::text ILIKE $match)' ]);
            assert.deepEqual(parameters, { field1: 'haystack', match: '%needle%' });
        });

        it('should return passed result if no match filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { otherField: 'needle' },
                searchableFields: ['field1', 'field2', 'field3']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });

        it('should return passed result if ther is no searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { match: 'needle' },
                searchableFields: []
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });

        it('should return empty result if no match filter nor result is given', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { otherField: 'needle' },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, []);
            assert.deepEqual(parameters, {});
        });

        it('should return empty result if no match filter nor result is given', function () {
            const { whereParts, parameters } = whereQueryGet.getMatch({
                filters: { match: 'needle' },
                searchableFields: []
            });

            assert.deepEqual(whereParts, []);
            assert.deepEqual(parameters, {});
        });
    });

    describe('getFrom', function () {
        it('should return query and parameter to test for date after field value if given field starting with from_', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date' },
                searchableFields: ['field', 'date']
            });

            assert.deepEqual(whereParts, [ 'date::timestamp >= $from_date::timestamp' ]);
            assert.deepEqual(parameters, { from_date: 'date' });
        });

        it('should work with several field starting with from_', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date1', from_birth: 'date2' },
                searchableFields: ['field', 'date', 'birth']
            });

            assert.deepEqual(whereParts, [
                'date::timestamp >= $from_date::timestamp',
                'birth::timestamp >= $from_birth::timestamp'
            ]);
            assert.deepEqual(parameters, { from_date: 'date1', from_birth: 'date2' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date' },
                searchableFields: ['field', 'date']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp >= $from_date::timestamp' ]);
            assert.deepEqual(parameters, { field1: 'haystack', from_date: 'date' });
        });

        it('should return passed result if no from_ filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date1', from_birth: 'date2' },
                searchableFields: ['field1', 'field2', 'field3']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });

        it('should return empty result if no from_ filter nor result is given', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date1', from_birth: 'date2' },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, []);
            assert.deepEqual(parameters, {});
        });

        it('should ignore from_(field) that are not present in searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getFrom({
                filters: { from_date: 'date1', from_birth: 'date2' },
                searchableFields: ['date', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, ['date::timestamp >= $from_date::timestamp']);
            assert.deepEqual(parameters, { from_date: 'date1'});
        });
    });

    describe('getTo', function () {
        it('should return query and parameter to test for date after field value if given field starting with to_', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date' },
                searchableFields: ['field', 'date']
            });

            assert.deepEqual(whereParts, [ 'date::timestamp <= $to_date::timestamp' ]);
            assert.deepEqual(parameters, { to_date: 'date' });
        });

        it('should work with several field starting with to_', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date1', to_birth: 'date2' },
                searchableFields: ['field', 'date', 'birth']
            });

            assert.deepEqual(whereParts, [
                'date::timestamp <= $to_date::timestamp',
                'birth::timestamp <= $to_birth::timestamp'
            ]);
            assert.deepEqual(parameters, { to_date: 'date1', to_birth: 'date2' });
        });

        it('should augment passed result if any', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date' },
                searchableFields: ['field', 'date']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp <= $to_date::timestamp' ]);
            assert.deepEqual(parameters, { field1: 'haystack', to_date: 'date' });
        });

        it('should return passed result if no to_ filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date1', to_birth: 'date2' },
                searchableFields: ['field1', 'field2', 'field3']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });

        it('should return empty result if no to_ filter nor result is given', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date1', to_birth: 'date2' },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, []);
            assert.deepEqual(parameters, {});
        });

        it('should ignore to_(field) that are not present in searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getTo({
                filters: { to_date: 'date1', to_birth: 'date2' },
                searchableFields: ['date', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, ['date::timestamp <= $to_date::timestamp']);
            assert.deepEqual(parameters, { to_date: 'date1'});
        });
    });

    describe('getQuery', function () {
        it('should return query and parameter for parameter in searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({
                filters: { field1: 1, field2: 2, field3: 3 },
                searchableFields: ['field1', 'field2', 'field3']
            });

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
            const { whereParts, parameters } = whereQueryGet.getQuery({
                filters: { field1: 1 },
                searchableFields: ['field1', 'other']
            }, {
                whereParts: ['field2 = $field2'],
                parameters: { field2: 2}
            });

            assert.deepEqual(whereParts, [ 'field2 = $field2', 'field1 = $field1' ]);
            assert.deepEqual(parameters, { field1: 1, field2: 2 });
        });

        it('should return passed result if no filter is given', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({
                filters: {},
                searchableFields: ['field1', 'field2', 'field3']
            }, {
                whereParts: ['field1 = $field1'],
                parameters: { field1: 'haystack'}
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 'haystack' });
        });

        it('should return empty result if there is no filter in searchableFields given', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({
                filters: { field4: 4, field5: 5 },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, []);
            assert.deepEqual(parameters, {});
        });

        it('should ignore field that are not present in searchableFields', function () {
            const { whereParts, parameters } = whereQueryGet.getQuery({
                filters: { field1: 1, field4: 4 },
                searchableFields: ['field1', 'field2', 'field3']
            });

            assert.deepEqual(whereParts, ['field1 = $field1']);
            assert.deepEqual(parameters, { field1: 1 });
        });
    });

});
