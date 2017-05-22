export default (cols = ['*']) => {
    if (cols === '*') {
        return 'RETURNING *';
    }
    if (!cols.length) {
        return '';
    }

    return `RETURNING ${cols.join(', ')}`;
};
