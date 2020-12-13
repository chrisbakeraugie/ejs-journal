const Entry = require('../models/entry');
const Project = require('../models/project');
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
    Entry.find({}).sort({ writtenDate: 'descending' }).then(entries => {
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
  },

  newProject: (req, res) => {
    res.render('project/newProject');
  },

  /**
   * Checks whether a project title exists, and if it does, will not create a new one.
   * The .create is in callback to manage async behavior
   */
  createProject: (req, res, next) => {
    Project.exists({ title: req.body.title }, function (err, doesExist) {
      if (err) {
        console.log('projectExists ' + err);
        return;
      } else {
        if (doesExist) {
          console.log(`entryController.createProject: Project title "${req.body.title}" already in use.`);
        } else {
          Project.create({
            title: req.body.title
          }).catch(err => {
            console.log('entryController.createProject Error: ' + err.message);
          });
        }
      }
    });
    next();
  }
};