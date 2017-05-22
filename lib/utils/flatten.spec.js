import { assert } from 'chai';
import flattenParameters from './flatten';

describe('flatten', () => {
    it('should flatten key containing array', () => {
        assert.deepEqual(flattenParameters({ column: ['value', 'other value', 'etc'] }), {
            column1: 'value',
            column2: 'other value',
            column3: 'etc',
        });
    });

    it('should not change other key', () => {
        assert.deepEqual(flattenParameters({ column: 'value', otherColumn: 'other value' }), {
            column: 'value',
            otherColumn: 'other value',
        });
    });

    it('should throw an error if flattened key would overwrite existing key', () => {
        assert.throw(
            () => flattenParameters({
                column: ['value', 'other value', 'etc'],
                column1: 'already here',
            }),
            'Cannot flatten "column:[value,other value,etc]" parameter, "column1" already exists'
        );
    });
});
