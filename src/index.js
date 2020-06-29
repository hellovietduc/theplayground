const api = require('./api');
const codeRunner = require('./service/code-runner');
const apiConfig = require('./config/api.json');
const codeRunnerConfig = require('./config/code-runner.json');

const start = async () => {
    await codeRunner.init(codeRunnerConfig);
    api.init(apiConfig);
};

start();
