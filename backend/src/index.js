const api = require('./api');
const codeRunner = require('./service/code-runner');
const apiConfig = require('./config/api.json');
const codeRunnerConfig = require('./config/code-runner.json');

const start = async () => {
    const supportedLanguages = Object.keys(codeRunnerConfig.environments);
    apiConfig.validation.supportedLanguages = new Set(supportedLanguages);

    await codeRunner.init(codeRunnerConfig);
    api.init(apiConfig);
};

start();
