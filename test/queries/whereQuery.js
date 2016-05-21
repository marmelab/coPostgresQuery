import * as whereQueryGet from '../../lib/queries/whereQuery';
import whereQuery, { sortQueryType, getFieldType, getFieldPlaceHolder } from '../../lib/queries/whereQuery';

describe('whereQuery', function () {

    it('should return whereQuery', function () {
        assert.deepEqual(whereQuery({
            field1: 1,
            to_field2: new Date(500),
            from_field3: new Date(800),
            match: 6,
            in_field: ['some value', 'other value'],
            field4: 'ignored'
        }, ['field1', 'field2', 'field3', 'in_field']),
        'WHERE (field1::text ILIKE %$match% OR field2::text ILIKE %$match% OR field3::text ILIKE %$match% OR in_field::text ILIKE %$match%) AND field3::timestamp >= $from_field3::timestamp AND field2::timestamp <= $to_field2::timestamp AND field1 = $field1 AND in_field IN ($in_field1, $in_field2)');
    });

    describe('getFieldPlaceHolder', function () {

        it('should return value if value is IS_NULL or IS_NOT_NULL', function () {
            assert.equal(getFieldPlaceHolder('fieldName', 'IS_NULL'), 'IS_NULL');
            assert.equal(getFieldPlaceHolder('fieldName', 'IS_NOT_NULL'), 'IS_NOT_NULL');
        });

        it('should return IN query if value is an array', function () {
            assert.equal(getFieldPlaceHolder('fieldName', ['some value', 'other value']), 'IN ($fieldName1, $fieldName2)');
        });

        it('should return $field otherwise', function () {
            assert.equal(getFieldPlaceHolder('fieldName', 'some value'), '= $fieldName');
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
            const whereParts = whereQueryGet.getMatch({ match: 'needle' }, ['field1', 'field2', 'field3']);

            assert.deepEqual(whereParts, [ '(field1::text ILIKE %$match% OR field2::text ILIKE %$match% OR field3::text ILIKE %$match%)' ]);
        });

        it('should augment passed result if any', function () {
            const whereParts = whereQueryGet.getMatch({ match: 'needle' }, ['field1', 'field2'], ['field1 = $field1']);

            assert.deepEqual(whereParts, [ 'field1 = $field1', '(field1::text ILIKE %$match% OR field2::text ILIKE %$match%)' ]);
        });

        it('should return passed result if there is no searchableFields', function () {
            const whereParts = whereQueryGet.getMatch({ match: 'needle' }, [], ['field1 = $field1']);

            assert.deepEqual(whereParts, ['field1 = $field1']);
        });
    });

    describe('getFrom', function () {
        it('should return query and parameter to test for date after field value if given field starting with from_', function () {
            const whereParts = whereQueryGet.getFrom({ from_date: 'date' }, ['field', 'date']);

            assert.deepEqual(whereParts, [ 'date::timestamp >= $from_date::timestamp' ]);
        });

        it('should work with several field starting with from_', function () {
            const whereParts = whereQueryGet.getFrom({ from_date: 'date1', from_birth: 'date2' }, ['field', 'date', 'birth']);

            assert.deepEqual(whereParts, [
                'date::timestamp >= $from_date::timestamp',
                'birth::timestamp >= $from_birth::timestamp'
            ]);
        });

        it('should augment passed result if any', function () {
            const whereParts = whereQueryGet.getFrom({ from_date: 'date' }, ['field', 'date'], ['field1 = $field1']);

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp >= $from_date::timestamp' ]);
        });
    });

    describe('getTo', function () {
        it('should return query and parameter to test for date after field value if given field starting with to_', function () {
            const whereParts = whereQueryGet.getTo({ to_date: 'date' }, ['field', 'date']);

            assert.deepEqual(whereParts, [ 'date::timestamp <= $to_date::timestamp' ]);
        });

        it('should work with several field starting with to_', function () {
            const whereParts = whereQueryGet.getTo({ to_date: 'date1', to_birth: 'date2' }, ['field', 'date', 'birth']);

            assert.deepEqual(whereParts, [
                'date::timestamp <= $to_date::timestamp',
                'birth::timestamp <= $to_birth::timestamp'
            ]);
        });

        it('should augment passed result if any', function () {
            const whereParts = whereQueryGet.getTo({ to_date: 'date' }, ['field', 'date'], ['field1 = $field1']);

            assert.deepEqual(whereParts, [ 'field1 = $field1', 'date::timestamp <= $to_date::timestamp' ]);
        });
    });

    describe('getQuery', function () {
        it('should return query and parameter for parameter in searchableFields', function () {
            const whereParts = whereQueryGet.getQuery({ field1: 1, field2: 2, field3: 3 }, ['field1', 'field2', 'field3']);

            assert.deepEqual(whereParts, [
                'field1 = $field1',
                'field2 = $field2',
                'field3 = $field3'
            ]);
        });

        it('should augment passed result if any', function () {
            const whereParts = whereQueryGet.getQuery({ field1: 1 }, ['field1', 'other'], ['field2 = $field2']);

            assert.deepEqual(whereParts, [ 'field2 = $field2', 'field1 = $field1' ]);
        });

        it('should return passed result if no filter is given', function () {
            const whereParts = whereQueryGet.getQuery({}, ['field1', 'field2', 'field3'], ['field1 = $field1']);

            assert.deepEqual(whereParts, ['field1 = $field1']);
        });
    });

});
