const { Signale } = require('signale');

const loggers = {};

module.exports = service => {
    if (loggers[service]) return loggers[service];
    const custom = new Signale({ scope: service });
    loggers[service] = custom;
    return custom;
};
