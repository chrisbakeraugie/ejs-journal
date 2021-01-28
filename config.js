/**
 * This is the file to store sensitive information during development. 
 */
// eslint-disable-next-line no-undef
const env = process.env.NODE_ENV || 'development';
const credentials = require(`./.credentials.${env}`);
module.exports = { credentials };