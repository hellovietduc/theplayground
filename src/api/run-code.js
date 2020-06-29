const { v4: uuidv4 } = require('uuid');
const codeRunner = require('../service/code-runner');

const validate = (req, res, next) => {
    const { lang } = req.params;
    const { code } = req.body;
    const { supportedLanguages } = req.config.validation;

    if (!supportedLanguages.includes(lang)) {
        res.body = {
            error: 'LANG_NOT_SUPPORTED'
        };
        return res.send(400);
    }

    if (!code || !code.trim()) {
        res.body = {
            error: 'CODE_EMPTY'
        };
        return res.send(400);
    }

    req.lang = lang;
    req.code = code.trim();

    next();
};

const runCode = (req, res) => {
    const { code, lang } = req;
    const id = uuidv4();
    res.body = { id };
    res.send();

    codeRunner.run(code, lang, id);
};

module.exports = [validate, runCode];
