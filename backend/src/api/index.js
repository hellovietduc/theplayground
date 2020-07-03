const api = require('restana')();
const cors = require('cors');
const bodyParser = require('body-parser');
const runCode = require('./run-code');
const getTemplate = require('./get-template');
const logger = require('../util/log')('API');

module.exports.init = async config => {
    api.use(cors());
    api.use(bodyParser.urlencoded({ extended: true }));

    const attachConfig = (req, res, next) => {
        req.config = config;
        next();
    };
    api.post('/code/run/:lang', attachConfig, ...runCode);
    api.get('/template/:lang', attachConfig, ...getTemplate);

    await api.start(config.port);
    logger.success(`Listening on ${config.port}`);
};
