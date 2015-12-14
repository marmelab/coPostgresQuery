import whereQuery from './whereQuery';

export default function (table, selectorFields, returningFields) {
    return function (parameters) {
        const where = whereQuery(parameters, selectorFields);

        const sql = `SELECT ${returningFields} ${where.query} LIMIT 1`;

        return { sql, parameters };
    };
}
