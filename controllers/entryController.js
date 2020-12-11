const Entry = require('../models/entry');
module.exports = {

  /**
   * Renders the home entry page
   */
  entryHome: (req, res) => {
    res.render('project/newEntry');
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
  },

  /**
   * Uses .find() to find all entries, .sort() organizes by writtenDate in descending order,
   * and places them into the res.locals object
   * Passes next().
   * 
   */
  getAllEntries: (req, res, next) => {
    Entry.find({}).sort({writtenDate: 'descending'}).then(entries => {
      res.locals.entries = entries;
      next();
    }).catch(err => {
      console.log('Error finding entries at entryController.showAllEntries ' + err.message);
      next(err);
    }
    );
  },

  /**
   * Renders the project page, which is currently a list of all submissions in order
   */
  showAllEntries: (req, res) => {
    res.render('project/project');
  }
};