import { assert } from 'chai';

import returningQuery from './returningQuery';

describe('returningQuery', () => {
    it('should return RETURNING clause with given fields', () => {
        assert.equal(returningQuery(['field1', 'field2']), 'RETURNING field1, field2');
    });

    it('should return RETURNING *  clause if received nothing', () => {
        assert.equal(returningQuery(), 'RETURNING *');
    });

    it('should return ``  clause if received empty array', () => {
        assert.equal(returningQuery([]), '');
    });
});
