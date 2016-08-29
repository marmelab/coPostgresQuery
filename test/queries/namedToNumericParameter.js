import namedToNumericParameter from '../../lib/queries/namedToNumericParameter';

describe('namedToNumericParameter', () => {
    it('should replace named parameters by number one', () => {
        assert.deepEqual(namedToNumericParameter('$one, $two, $three', {
            one: 'first',
            two: 'second',
            three: 'third',
        }), {
            sql: '$1, $2, $3',
            parameters: ['first', 'second', 'third'],
        });
    });

    it('should return passed sql and empty array as parameter if no named parameter', () => {
        assert.deepEqual(namedToNumericParameter('no named parameter'), {
            sql: 'no named parameter',
            parameters: [],
        });
    });

    it('should throw an error if a named token is not in parameter', () => {
        assert.throw(() => namedToNumericParameter('$one, $two, $three', {
            three: 'third',
        }), 'Missing Parameters: one, two');
    });

    it('should ignore unused parameter', () => {
        assert.deepEqual(namedToNumericParameter('$one, $two', {
            one: 'first',
            two: 'second',
            three: 'third',
        }), {
            sql: '$1, $2',
            parameters: ['first', 'second'],
        });
    });

    it('should accept null value in parameter', () => {
        assert.deepEqual(namedToNumericParameter('$one, $two, $three', {
            one: 'first',
            two: null,
            three: 'third',
        }), {
            sql: '$1, $2, $3',
            parameters: ['first', null, 'third'],
        });
    });
});
