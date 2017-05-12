import middleware from '../../lib/utils/middleware';

describe('middleware', () => {
    it('should execute used function f with options, and null', () => {
        let receivedArgs;
        const f = function (...args) {
            receivedArgs = args;

            return 'fResult';
        };
        const result = middleware('entry', 'options')
        .use(f)
        .execute('empty result');

        assert.deepEqual(receivedArgs, ['entry', 'options', 'empty result']);
        assert.equal(result, 'fResult');
    });

    it('should execute used function in order, passing result of the previous one to the next', () => {
        let firstArguments;
        let nextArguments;
        const first = function (...args) {
            firstArguments = args;
            return 'firstResult';
        };
        const next = function (...args) {
            nextArguments = args;
            return 'nextResult';
        };
        const result = middleware('entry', 'options')
        .use(first)
        .use(next)
        .execute('empty result');

        assert.deepEqual(firstArguments, ['entry', 'options', 'empty result']);

        assert.deepEqual(nextArguments, ['entry', 'options', 'firstResult']);

        assert.equal(result, 'nextResult');
    });

    it('should apply used functon to targeted entry key', () => {
        let targetPileArguments;
        let targetFaceArguments;
        const targetPile = function (...args) {
            targetPileArguments = args;
            return 'targetPileResult';
        };
        const targetFace = function (...args) {
            targetFaceArguments = args;
            return 'targetFaceResult';
        };
        const result = middleware({ pile: 'tic', face: 'tac' }, 'options')
        .use(targetPile, 'pile')
        .use(targetFace, 'face')
        .execute('empty result');

        assert.deepEqual(targetPileArguments, ['tic', 'options', 'empty result']);

        assert.deepEqual(targetFaceArguments, ['tac', 'options', 'targetPileResult']);

        assert.equal(result, 'targetFaceResult');
    });
});
