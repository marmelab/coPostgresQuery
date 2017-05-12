export default id => {
    if (typeof id === 'undefined' || id === null) {
        throw new Error('No value set.');
    }

    return id;
};
