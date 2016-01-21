'use strict';

import valueSubQuery from '../../queries/valueSubQuery';

describe('valueSubQuery', function () {

    it('should return subQuery filtering out unwanted field', function () {
        assert.equal(valueSubQuery(['login', 'first_name'], '5'), '$login5, $first_name5');
    });
});
