const api = require('./api');
const apiConfig = require('./config/api.json');

const start = async () => {
    api.init(apiConfig);
};

start();
