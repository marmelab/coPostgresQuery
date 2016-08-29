import flattenParameters from '../../lib/queries/flattenParameters';

describe('flattenParameters', () => {
    it('should flatten key wcontianing array', () => {
        assert.deepEqual(flattenParameters({ field: ['value', 'other value', 'etc'] }), {
            field1: 'value',
            field2: 'other value',
            field3: 'etc',
        });
    });

    it('should not change othe key', () => {
        assert.deepEqual(flattenParameters({ field: 'value', otherField: 'othe value' }), {
            field: 'value',
            otherField: 'othe value',
        });
    });

    it('should throw an error if flattened key would overwrite existing key', () => {
        assert.throw(
            () => flattenParameters({
                field: ['value', 'other value', 'etc'],
                field1: 'already here',
            }),
            'Cannot flatten "field:[value,other value,etc]" parameter, "field1" already exists'
        );
    });
});
