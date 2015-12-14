export default function valueSubQuerier(writableFields) {
    return function getValueSubQuery(data, suffix = '') {

        const valueSubQuery = writableFields
        .map((field) => ({
            column: field,
            sql: `$${field}${suffix}`,
            parameter: {
                [`${field}${suffix}`]: data[field] || 'NULL'
            }
        }));
        const columns = valueSubQuery.map(v => v.column);
        const sql = valueSubQuery.map(v => v.sql).join(', ');
        const parameters = valueSubQuery.map(v => v.parameter)
        .reduce((result, v) => ({...result, ...v}), {});

        return { columns, sql, parameters };
    };
};
