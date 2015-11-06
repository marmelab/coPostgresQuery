'use strict';

import selectPageFactory from '../../base/selectPage';

describe.only('selectPage', function () {
    var selectPage;

    var mockClientFactory = function () {
        return {
            query: function* ({query, parameters}) {
                this.query = query;
                this.parameters = parameters;

                return {
                    rows: []
                };
            }
        };
    };

    it('should use a simple query if querying on a single table', function* () {
        var client = mockClientFactory();
        selectPage = selectPageFactory('table', ['field1', 'field2'])(client);

        yield selectPage();

        assert.equal(client.query, 'SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table ORDER BY id ASC');
    });

    it('should use a "WITH result AS" query if querying on a joined table', function* () {
        var client = mockClientFactory();
        selectPage = selectPageFactory('table1 JOIN table2 ON table1.table2_id table2.id', ['field1', 'field2'])(client);

        yield selectPage();

        assert.equal(client.query, 'WITH result AS (SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table1 JOIN table2 ON table1.table2_id table2.id) SELECT *, COUNT(*) OVER() as totalCount FROM result ORDER BY id ASC');
    });

    it('should use a "WITH result AS" query if enabling the withQuery extraOptions', function* () {
        var client = mockClientFactory();
        selectPage = selectPageFactory('table', ['field1', 'field2'], ['field1', 'field2'], {withQuery: true})(client);

        yield selectPage();

        assert.equal(client.query, 'WITH result AS (SELECT field1, field2, COUNT(*) OVER() as totalCount FROM table) SELECT *, COUNT(*) OVER() as totalCount FROM result ORDER BY id ASC');
    });
});
