// mujhe ek aaisa function bana hai jise ham wrapAsync name denge

module.exports = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};