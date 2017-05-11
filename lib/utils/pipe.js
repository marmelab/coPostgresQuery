export default (...fns) => x =>
    fns.reduce((acc, fn) => fn(acc), x);
