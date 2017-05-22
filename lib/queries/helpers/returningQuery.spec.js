import { assert } from 'chai';

import returningQuery from './returningQuery';

describe('returningQuery', () => {
    it('should return RETURNING clause with given cols', () => {
        assert.equal(returningQuery(['column1', 'column2']), 'RETURNING column1, column2');
    });

    it('should return RETURNING *  clause if received nothing', () => {
        assert.equal(returningQuery(), 'RETURNING *');
    });

    it('should return ``  clause if received empty array', () => {
        assert.equal(returningQuery([]), '');
    });
});
