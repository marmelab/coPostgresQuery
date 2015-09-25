'use strict';

import field from '../../base/field';

describe('base/field', function () {
    const fieldMap = {
        table1: [
            'field1',
            'field2',
            'field3'
        ],
        table2: ['field4'],
        table3: ['field5'],
        composite: [
            'field4 = field3 AS field6',
            'COALESCE(SELECT * from table4 WHERE id= field1) AS field7'
        ]
    };

    describe('getFieldNames', function () {
        it('should return list of all field name', function () {
            assert.deepEqual(field.getFieldNames(fieldMap), ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7']);

        });
    });

    describe('getFullFieldNames', function () {

        it('should return list of all field name namespaced with their table', function () {
            assert.deepEqual(field.getFullFieldNames(fieldMap), [
                'table1.field1 AS field1',
                'table1.field2 AS field2',
                'table1.field3 AS field3',
                'table2.field4 AS field4',
                'table3.field5 AS field5',
                'field4 = field3 AS field6',
                'COALESCE(SELECT * from table4 WHERE id= field1) AS field7'
            ]);
        });
    });
});
