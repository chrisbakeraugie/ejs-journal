/**
 * errorController is for catching and logging errors, and rendering
 * the error pages
 */
const httpCode = require('http-status-codes');

module.exports = {

  /**
   * Do not remove unsued variable because express
   * uses the number of parameter to know which parameter
   * is which
   */
  // eslint-disable-next-line no-unused-vars
  respondInternalError: (error, req, res, next) => {
    const code = httpCode.INTERNAL_SERVER_ERROR;
    console.log(`Error 500 occurred: ${error.stack}`);
    res.status(code);
    res.render('error', { code });

  },

  respondNoResourceFound: (req, res) => {
    const code = httpCode.NOT_FOUND;
    res.status(code);
    res.render('error', { code });
  }
};