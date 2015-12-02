'use strict';

import middleware from '../../utils/middleware';

describe('middleware', function () {
    it('should execute used function f with options, and null', function () {
        let receivedArgs;
        const f = function (...args) {
            receivedArgs = args;

            return 'fResult';
        };
        const result = middleware('entry')
        .use(f)
        .execute('empty result');

        assert.deepEqual(receivedArgs, ['entry', 'empty result']);
        assert.equal(result, 'fResult');
    });

    it('should execute used function in order, passing result of the previous one to the next', function () {
        let firstArguments, nextArguments;
        const first = function (...args) {
            firstArguments = args;
            return 'firstResult';
        };
        const next = function (...args) {
            nextArguments = args;
            return 'nextResult';
        };
        const result = middleware('entry')
        .use(first)
        .use(next)
        .execute('empty result');

        assert.deepEqual(firstArguments, ['entry', 'empty result']);

        assert.deepEqual(nextArguments, ['entry', 'firstResult']);

        assert.equal(result, 'nextResult');
    });

    it('should apply used functon to targeted entry key', function () {
        let targetPileArguments, targetFaceArguments;
        const targetPile = function (...args) {
            targetPileArguments = args;
            return 'targetPileResult';
        };
        const targetFace = function (...args) {
            targetFaceArguments = args;
            return 'targetFaceResult';
        };
        const result = middleware({ pile: 'tic', face: 'tac'})
        .use(targetPile, 'pile')
        .use(targetFace, 'face')
        .execute('empty result');

        assert.deepEqual(targetPileArguments, ['tic', 'empty result']);

        assert.deepEqual(targetFaceArguments, ['tac', 'targetPileResult']);

        assert.equal(result, 'targetFaceResult');
    });
});
