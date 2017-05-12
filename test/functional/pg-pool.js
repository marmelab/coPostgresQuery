describe('PgPool', () => {
    describe('saga', () => {
        it('should execute yielded query', async () => {
            function* greet() {
                const result = yield { sql: 'SELECT \'hello world\'', returnOne: true };

                return result['?column?'];
            }

            assert.equal(await db.saga(greet()), 'hello world');
        });

        it('should allow to catch error from yielded query', async () => {
            const invalidQuery = () => ({ sql: 'BOOM' });
            function* getSyntaxError() {
                try {
                    yield invalidQuery();
                    return null;
                } catch (error) {
                    return error.message;
                }
            }

            assert.equal(await db.saga(getSyntaxError()), 'syntax error at or near "BOOM"');
        });

        it('should reject with thrown error', (done) => {
            function* explode() {
                yield { sql: '' };
                throw new Error('Boom');
            }
            db.saga(explode())
            .then(() => done('should have thrown an error'))
            .catch(error => {
                assert.equal(error.message, 'Boom');
                done();
            })
            .catch(done);
        });

        it('should pass argument to generator', async () => {
            function* getArgs(...args) {
                yield { sql: '' };
                return args;
            }

            assert.deepEqual(await db.saga(getArgs('arg1', 'arg2')), ['arg1', 'arg2']);
        });

        it('should allow to yield array of multiple query', async () => {
            function* queryArray() {
                const result = yield [
                    { sql: 'SELECT \'first\'', returnOne: true },
                    { sql: 'SELECT \'second\'', returnOne: true },
                    { sql: 'SELECT \'third\'', returnOne: true },
                ];

                return result;
            }

            assert.deepEqual(await db.saga(queryArray()), [
                { '?column?': 'first' },
                { '?column?': 'second' },
                { '?column?': 'third' },
            ]);
        });

        it('should reject if one of the query in array fail', async () => {
            function* queryArray() {
                try {
                    const result = yield [
                        { sql: 'SELECT \'first\'', returnOne: true },
                        { sql: 'SELECT \'second\'', returnOne: true },
                        { sql: 'SELECT \'third\'', returnOne: true },
                        { sql: 'BOOM', returnOne: true },
                    ];

                    return result;
                } catch (error) {
                    return error.message;
                }
            }

            assert.equal(await db.saga(queryArray()), 'syntax error at or near "BOOM"');
        });

        it('should allow to yield literal of multiple query', async () => {
            function* queryLiteral() {
                const result = yield {
                    a: { sql: 'SELECT \'a\'', returnOne: true },
                    b: { sql: 'SELECT \'b\'', returnOne: true },
                    c: { sql: 'SELECT \'c\'', returnOne: true },
                };

                return result;
            }

            assert.deepEqual(await db.saga(queryLiteral()), {
                a: { '?column?': 'a' },
                b: { '?column?': 'b' },
                c: { '?column?': 'c' },
            });
        });

        it('should reject if one of the query in literal fail', async () => {
            function* queryLiteral() {
                try {
                    const result = yield {
                        a: { sql: 'SELECT \'a\'', returnOne: true },
                        b: { sql: 'SELECT \'b\'', returnOne: true },
                        c: { sql: 'SELECT \'c\'', returnOne: true },
                        d: { sql: 'BOOM', returnOne: true },
                    };

                    return result;
                } catch (error) {
                    return error.message;
                }
            }

            assert.equal(await db.saga(queryLiteral()), 'syntax error at or near "BOOM"');
        });
    });
});
