const Entry = require('../models/entry');
module.exports = {

  /**
   * Renders the home entry page
   */
  entryHome: (req, res) => {
    res.render('newEntry');
  },

  /**
   * Receives posted form, 'creates' to database, loads entryHome
   */
  entryPost: (req, res, next) => {
    Entry.create({
      title: req.body.title,
      description: req.body.description,
      writtenDate: new Date(),
    }).catch(error => console.log('entryController.entryPost error ' + error.message));
    next();
  }
};