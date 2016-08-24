export default function curry(fn, ...args) {
    if (args.length >= fn.length) {
        return fn(...args);
    }

    return curry.bind(this, fn, ...args);
}
