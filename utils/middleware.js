export default function init(entry, options) {
    var handlers = [];

    return {
        use: function (fn, target) {
            handlers.push({ fn, target });
            return this;
        },
        execute: function execute(emptyResult) {
            return handlers.reduce(function (result, { fn, target }) {
                return fn(target ? entry[target] || {} : entry, options, result);
            }, emptyResult);

        }
    };
};
