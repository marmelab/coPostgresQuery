import whereQuery from './whereQuery';
import sanitizeIdentifier from './sanitizeIdentifier';

export default ({ table, idFields, returnFields = ['*'] }) => {
    const select = returnFields.join(', ');

    return (rawParameters) => {
        const parameters = sanitizeIdentifier(idFields)(rawParameters);
        const where = whereQuery(parameters, idFields);

        const sql = `SELECT ${select} FROM ${table} ${where} LIMIT 1`;

        return { sql, parameters, returnOne: true };
    };
}
