module.exports = {

  /**
   * Renders the home entry page
   */
  entryHome: (req, res) => {
    res.render('newEntry');
  },

  /**
   * Receives posted form, submits to database, loads entryHome
   */
  entryPost: (req, res, next) => {
    console.log(req.body);
    next();
  }
};