const codeRunner = require('../service/code-runner');

const validate = (req, res, next) => {
    const { lang } = req.params;
    const { code } = req.body;
    const { supportedLanguages } = req.config.validation;

    if (!supportedLanguages.includes(lang)) {
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
    const { code, lang } = req;
    const output = await codeRunner.run(code, lang);
    res.body = output;
    res.send();
};

module.exports = [validate, runCode];
