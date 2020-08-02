const codeRunner = require('../service/code-runner');
const logger = require('../util/log')('API');

const validate = (req, res, next) => {
    const { lang } = req.params;
    const { code } = req.body;
    const { supportedLanguages } = req.config.validation;

    if (!supportedLanguages.has(lang)) {
        logger.error('Language not supported:', lang);
        res.body = 'Language not supported.';
        return res.send(400);
    }

    if (!code || !code.trim()) {
        res.body = '';
        return res.send();
    }

    req.lang = lang;
    req.code = code.trim();

    next();
};

const runCode = async (req, res) => {
    try {
        const { code, lang } = req;
        const output = await codeRunner.run(code, lang);
        res.body = output;
        res.send();
    } catch (err) {
        logger.error('Run code error:', err);
        if (err instanceof codeRunner.Error) {
            res.body = err.message;
        } else {
            res.body = 'Unknown error.';
        }
        res.send(400);
    }
};

module.exports = [validate, runCode];
