const api = require('restana')();
const bodyParser = require('body-parser');
const signale = require('signale');
const runCode = require('./run-code');

module.exports.init = async config => {
    api.use(bodyParser.json());
    api
        .post('/code/run/:lang', ...runCode);

    await api.start(config.port);
    signale.success(`[API] Listening on ${config.port}`);
};
