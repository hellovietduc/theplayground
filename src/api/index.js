const api = require('restana')();
const bodyParser = require('body-parser');
const runCode = require('./run-code');
const logger = require('../util/log')('API');

module.exports.init = async config => {
    api.use(bodyParser.urlencoded({ extended: true }));
    api.use(bodyParser.json());

    const attachConfig = (req, res, next) => {
        req.config = config;
        next();
    };
    api.post('/code/run/:lang', attachConfig, ...runCode);

    await api.start(config.port);
    logger.success(`Listening on ${config.port}`);
};
