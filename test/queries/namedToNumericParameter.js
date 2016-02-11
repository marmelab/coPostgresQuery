import namedToNumericParameter from '../../queries/namedToNumericParameter';

describe.only('namedToNumericParameter', function () {
    it('should replace named parameters by number one', function () {
        assert.deepEqual(namedToNumericParameter('$one, $two, $three', {
            one: 'first',
            two: 'second',
            three: 'third'
        }), {
            sql: '$1, $2, $3',
            parameters: ['first', 'second', 'third']
        });
    });

    it('should return passed sql and empty array as parameter if no named parameter', function () {
        assert.deepEqual(namedToNumericParameter('no named parameter'), {
            sql: 'no named parameter',
            parameters: []
        });
    });

    it('should throw an error if a named token is not in parameter', function () {
        assert.throw(() => namedToNumericParameter('$one, $two, $three', {
            three: 'third'
        }), 'Missing Parameters: one, two');
    });

    it('should ignore unused parameter', function () {
        assert.deepEqual(namedToNumericParameter('$one, $two', {
            one: 'first',
            two: 'second',
            three: 'third'
        }), {
            sql: '$1, $2',
            parameters: ['first', 'second']
        });
    });
});
