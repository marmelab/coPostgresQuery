import { assert } from 'chai';
import whereQuery, * as whereQueryGet from './whereQuery';

describe('whereQuery', () => {
    it('should return whereQuery', () => {
        assert.deepEqual(whereQuery({
            column1: 1,
            to_column2: new Date(500),
            from_column3: new Date(800),
            match: '%6%',
            column4: ['some value', 'other value'],
            like_column5: 'contain',
            'table.column6': 'complex',
            column7: 'ignored',
        }, ['column1', 'column2', 'column3', 'column4', 'column5', 'table.column6']), [
            'WHERE (column1::text ILIKE $match',
            'OR column2::text ILIKE $match',
            'OR column3::text ILIKE $match',
            'OR column4::text ILIKE $match',
            'OR column5::text ILIKE $match',
            'OR table.column6::text ILIKE $match)',
            'AND column3::timestamp >= $from_column3::timestamp',
            'AND column2::timestamp <= $to_column2::timestamp',
            'AND column5::text ILIKE $like_column5',
            'AND column1 = $column1',
            'AND column4 IN ($column41, $column42)',
            'AND table.column6 = $table__column6',
        ].join(' '));
    });

    describe('getColPlaceHolder', () => {
        it('should return value if value is IS_NULL or IS_NOT_NULL', () => {
            assert.equal(whereQueryGet.getColPlaceHolder('colName', 'IS_NULL'), 'IS_NULL');
            assert.equal(
                whereQueryGet.getColPlaceHolder('colName', 'IS_NOT_NULL'),
                'IS_NOT_NULL'
            );
        });

        it('should return IN query if value is an array', () => {
            assert.equal(
                whereQueryGet.getColPlaceHolder('colName', ['some value', 'other value']),
                'IN ($colName1, $colName2)'
            );
        });

        it('should return = $colName otherwise', () => {
            assert.equal(
                whereQueryGet.getColPlaceHolder('colName', 'some value'),
                '= $colName'
            );
        });
    });

    describe('getColType', () => {
        it('should return query, if column is in searchableCol', () => {
            assert.equal(whereQueryGet.getColType('col', ['col']), 'query');
        });

        it('should return match, if col is match and searchableCols contain at least one element', () => {
            assert.equal(whereQueryGet.getColType('match', ['col']), 'match');
        });

        it('should return discarded if col is match but searchableCols is empty', () => {
            assert.equal(whereQueryGet.getColType('match', []), 'discarded');
        });

        it('should return discarded if col is not in searchableCols', () => {
            assert.equal(whereQueryGet.getColType('needle', ['haystack']), 'discarded');
        });

        it('should return to if column is suffixed by to and is in searchableCols', () => {
            assert.equal(whereQueryGet.getColType('to_column', ['column']), 'to');
        });

        it('should return discarded if column is suffixed by to but is not in searchableCols', () => {
            assert.equal(whereQueryGet.getColType('to_column', ['other_column']), 'discarded');
        });

        it('should return from if column is suffixed by from and is in searchableCols', () => {
            assert.equal(whereQueryGet.getColType('from_column', ['column']), 'from');
        });

        it('should return discarded if column is suffixed by from but is not in searchableCols', () => {
            assert.equal(whereQueryGet.getColType('from_column', ['other_column']), 'discarded');
        });
    });

    describe('sortQueryType', () => {
        it('should regroup query by their type', () => {
            assert.deepEqual(whereQueryGet.sortQueryType({
                column1: 1,
                to_column2: 2,
                from_column3: 3,
                like_column4: 4,
                match: 5,
                column5: 6,
            }, ['column1', 'column2', 'column3', 'column4']), {
                query: {
                    column1: 1,
                },
                to: {
                    to_column2: 2,
                },
                from: {
                    from_column3: 3,
                },
                like: {
                    like_column4: 4,
                },
                match: {
                    match: 5,
                },
                discarded: {
                    column5: 6,
                },
            });
        });
    });

    describe('getMatch', () => {
        it('should return query and parameter to match a given value if match filter is given', () => {
            const whereParts = whereQueryGet.getMatch(
                { match: 'needle' },
                ['column1', 'column2', 'column3']
            );

            assert.deepEqual(whereParts, [
                '(column1::text ILIKE $match OR column2::text ILIKE $match OR column3::text ILIKE $match)',
            ]);
        });

        it('should augment passed result if any', () => {
            const whereParts = whereQueryGet.getMatch(
                { match: 'needle' },
                ['column1', 'column2'],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, [
                'column1 = $column1', '(column1::text ILIKE $match OR column2::text ILIKE $match)',
            ]);
        });

        it('should return passed result if there is no searchableCols', () => {
            const whereParts = whereQueryGet.getMatch(
                { match: 'needle' },
                [],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, ['column1 = $column1']);
        });
    });

    describe('getFrom', () => {
        it('should return query and parameter to test for date after column value if given column starting with from_', () => {
            const whereParts = whereQueryGet.getFrom({ from_date: 'date' }, ['column', 'date']);

            assert.deepEqual(whereParts, ['date::timestamp >= $from_date::timestamp']);
        });

        it('should work with several column starting with from_', () => {
            const whereParts = whereQueryGet.getFrom(
                { from_date: 'date1', from_birth: 'date2' },
                ['column', 'date', 'birth']
            );

            assert.deepEqual(whereParts, [
                'date::timestamp >= $from_date::timestamp',
                'birth::timestamp >= $from_birth::timestamp',
            ]);
        });

        it('should augment passed result if any', () => {
            const whereParts = whereQueryGet.getFrom(
                { from_date: 'date' },
                ['column', 'date'],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, [
                'column1 = $column1', 'date::timestamp >= $from_date::timestamp',
            ]);
        });
    });

    describe('getTo', () => {
        it('should return query and parameter to test for date after column value if given column starting with to_', () => {
            const whereParts = whereQueryGet.getTo({ to_date: 'date' }, ['column', 'date']);

            assert.deepEqual(whereParts, ['date::timestamp <= $to_date::timestamp']);
        });

        it('should work with several column starting with to_', () => {
            const whereParts = whereQueryGet.getTo(
                { to_date: 'date1', to_birth: 'date2' },
                ['column', 'date', 'birth']
            );

            assert.deepEqual(whereParts, [
                'date::timestamp <= $to_date::timestamp',
                'birth::timestamp <= $to_birth::timestamp',
            ]);
        });

        it('should augment passed result if any', () => {
            const whereParts = whereQueryGet.getTo(
                { to_date: 'date' },
                ['column', 'date'],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, [
                'column1 = $column1', 'date::timestamp <= $to_date::timestamp',
            ]);
        });
    });

    describe('getLike', () => {
        it('should return query and parameter to test column like value if given column starting with like_', () => {
            const whereParts = whereQueryGet.getLike({ like_column: 'pattern' }, ['column']);

            assert.deepEqual(whereParts, ['column::text ILIKE $like_column']);
        });

        it('should augment passed result if any', () => {
            const whereParts = whereQueryGet.getLike(
                { like_column: 'pattern' },
                ['column'],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, ['column1 = $column1', 'column::text ILIKE $like_column']);
        });
    });

    describe('getQuery', () => {
        it('should return query and parameter for parameter in searchableCols', () => {
            const whereParts = whereQueryGet.getQuery(
                { column1: 1, column2: 2, column3: 3 },
                ['column1', 'column2', 'column3']
            );

            assert.deepEqual(whereParts, [
                'column1 = $column1',
                'column2 = $column2',
                'column3 = $column3',
            ]);
        });

        it('should return replace "." in column name by "__" for parameter name', () => {
            const whereParts = whereQueryGet.getQuery(
                { 'table.column1': 1, 'table.column2': 2, 'table.column3': 3 },
                ['table.column1', 'table.column2', 'table.column3']
            );

            assert.deepEqual(whereParts, [
                'table.column1 = $table__column1',
                'table.column2 = $table__column2',
                'table.column3 = $table__column3',
            ]);
        });

        it('should augment passed result if any', () => {
            const whereParts = whereQueryGet.getQuery(
                { column1: 1 },
                ['column1', 'other'],
                ['column2 = $column2']
            );

            assert.deepEqual(whereParts, ['column2 = $column2', 'column1 = $column1']);
        });

        it('should return passed result if no filter is given', () => {
            const whereParts = whereQueryGet.getQuery(
                {},
                ['column1', 'column2', 'column3'],
                ['column1 = $column1']
            );

            assert.deepEqual(whereParts, ['column1 = $column1']);
        });
    });
});
