/**
 * This is the file to store sensitive information during development. 
 */
// eslint-disable-next-line no-undef
const filePath = require('path');
// eslint-disable-next-line no-undef
const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line no-undef
const envPath = filePath.join(__dirname, `${env}.env`);
require('dotenv').config({ path: envPath });
console.log('Operating on ' + env + ' environment variables');
// const credentials = require(`./.credentials.${env}.env`);

// module.exports = { credentials };

