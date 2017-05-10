
describe('PgPool', () => {
    describe('saga', () => {
        it('should execute yielded query', async () => {
            const greet = db.saga(function* () {
                const result = yield { sql: 'SELECT \'hello world\'', returnOne: true };

                return result['?column?'];
            });

            assert.equal(await greet(), 'hello world');
        });

        it('should allow to catch error from yielded query', async () => {
            const invalidQuery = () => ({ sql: 'BOOM' });
            const getSyntaxError = db.saga(function* () {
                try {
                    yield invalidQuery();
                    return null;
                } catch (error) {
                    return error.message;
                }
            });

            assert.equal(await getSyntaxError(), 'syntax error at or near "BOOM"');
        });

        it('should reject with thrown error', (done) => {
            const explode = db.saga(function* () {
                yield { sql: '' };
                throw new Error('Boom');
            });
            explode()
            .then(() => done('should have thrown an error'))
            .catch(error => {
                assert.equal(error.message, 'Boom');
                done();
            })
            .catch(done);
        });

        it('should pass argument to generator', async () => {
            const getArgs = db.saga(function* (...args) {
                yield { sql: '' };
                return args;
            });

            assert.deepEqual(await getArgs('arg1', 'arg2'), ['arg1', 'arg2']);
        });
    });
});
