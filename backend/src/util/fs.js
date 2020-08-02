const fs = require('fs');
const { promisify } = require('util');

module.exports.readFile = promisify(fs.readFile);
module.exports.writeFile = promisify(fs.writeFile);
module.exports.unlink = promisify(fs.unlink);
