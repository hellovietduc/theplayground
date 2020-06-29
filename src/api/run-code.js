const { v4: uuidv4 } = require('uuid');

const validate = (req, res, next) => {
    next();
};

const runCode = (req, res) => {
    const id = uuidv4();
    res.body = {
        id
    };
    res.send();
};

module.exports = [validate, runCode];
