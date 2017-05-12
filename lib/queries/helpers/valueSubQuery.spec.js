import { assert } from 'chai';
import valueSubQuery from './valueSubQuery';

describe('valueSubQuery', () => {
    it('should return subQuery filtering out unwanted field', () => {
        assert.equal(valueSubQuery(['login', 'first_name'], '5'), '$login5, $first_name5');
    });
});
