export default (fields = ['*']) => {
    if (fields === '*') {
        return 'RETURNING *';
    }
    if (!fields.length) {
        return '';
    }

    return `RETURNING ${fields.join(', ')}`;
};
