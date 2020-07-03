const fs = require('fs');
const path = require('path');
const logger = require('../util/log')('API');

const validate = (req, res, next) => {
    const { lang } = req.params;
    const { supportedLanguages } = req.config.validation;

    if (!supportedLanguages.includes(lang)) {
        res.body = 'Language not supported.';
        return res.send(400);
    }

    req.lang = lang;
    next();
};

const getTemplate = (req, res) => {
    try {
        const { templateFolder } = req.config;
        const { lang } = req;

        const filePath = path.join(process.cwd(), templateFolder, lang);
        const output = fs.readFileSync(filePath, { encoding: 'utf-8' });

        res.body = output;
        res.send();
    } catch (err) {
        logger.error('Get template error:', err);
        res.body = 'Unknown error.';
        res.send(400);
    }
};

module.exports = [validate, getTemplate];
