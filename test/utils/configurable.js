import configurable from '../../lib/utils/configurable';

describe('configurable', function () {
    it('should add property to funtion', function () {
        const config = {
            a: 1,
            b: 1
        };

        const add = configurable(function add() {
            return config.a + config.b;
        }, config);

        assert.equal(add.a(), 1);
        assert.equal(add.b(), 1);

        assert.equal(add(), 2);

        add.a(2);
        add.b(3);

        assert.equal(add.a(), 2);
        assert.equal(add.b(), 3);

        assert.deepEqual(config, {
            a: 2,
            b: 3
        });

        assert.equal(add(), 5);
    });
});
