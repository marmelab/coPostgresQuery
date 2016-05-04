export default function configurable(targetFunction, config) {

    return Object.keys(config).reduce((func, item) => {
        func[item] = (value) => {
            if (!value) { return config[item]; }
            config[item] = value;

            return func;
        };

        return func;
    }, targetFunction);
}
