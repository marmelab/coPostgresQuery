import updateOneQuerier from '../../lib/queries/updateOne';

describe('QUERY updateOne', () => {
    it('shoul generate sql and parameter for updating one entity', () => {
        const updateOneQuery = updateOneQuerier('table', ['fielda', 'fieldb'], ['id']);
        assert.deepEqual(updateOneQuery(1, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda, fieldb=$fieldb
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda: 1,
                fieldb: 2,
            },
        });
    });

    it('should use third parameter to set idName if provided', () => {
        const updateOneQuery = updateOneQuerier('table', ['fielda', 'fieldb'], 'uid');
        assert.deepEqual(updateOneQuery(1, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda, fieldb=$fieldb
WHERE uid = $uid
RETURNING *`
            ),
            parameters: {
                uid: 1,
                fielda: 1,
                fieldb: 2,
            },
        });
    });

    it('should accept multiple id', () => {
        const updateOneQuery = updateOneQuerier('table', ['fielda', 'fieldb'], ['id', 'uid']);
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda, fieldb=$fieldb
WHERE id = $id AND uid = $uid
RETURNING *`
            ),
            parameters: {
                id: 1,
                uid: 2,
                fielda: 1,
                fieldb: 2,
            },
        });
    });

    it('should ignore selector not in selectorFields', () => {
        const updateOneQuery = updateOneQuerier('table', ['fielda', 'fieldb'], ['id']);
        assert.deepEqual(updateOneQuery({ id: 1, uid: 2 }, { fielda: 1, fieldb: 2 }), {
            sql: (
`UPDATE table
SET fielda=$fielda, fieldb=$fieldb
WHERE id = $id
RETURNING *`
            ),
            parameters: {
                id: 1,
                fielda: 1,
                fieldb: 2,
            },
        });
    });

    it('should throw an error if given idFieldNames does not match ids', () => {
        const updateOneQuery = updateOneQuerier('table', ['fielda', 'fieldb'], ['uid', 'id']);
        assert.throw(
            () => updateOneQuery({ id: 1 }, { fielda: 1, fieldb: 2 }),
            'Given object: (id) does not match keys: (uid, id)'
        );
    });
});
