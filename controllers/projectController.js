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
   * Receives posted form, 'creates' to database, links new entry to the project that it 
   * was posted from, and calls the next middleware
   */
  entryPost: (req, res, next) => {
    Entry.create({
      title: req.body.title,
      description: req.body.description,
      writtenDate: new Date(),
    }).then(newEntry => {
      Project.findByIdAndUpdate(req.params.projectId, { $push: { entries: newEntry._id } }).then(() => {
        next();
      }).catch(err => console.log('projectController.entryPost error ' + err.message));
    }).catch(err => console.log('projectController.entryPost error ' + err.message));
  },

  /**
   * Starts by finding the project by id (in the url params),
   * finding entries associated to that project, and then uses the
   * local.entries varablie to associate with ejs view
   * 
   */
  getAllEntries: (req, res, next) => {

    Project.findById(req.params.projectId).then(project => {
      res.locals.project = project;
      Entry.find({
        '_id': { $in: project.entries }
      }).sort({ writtenDate: 'descending' }).then(entries => {
        res.locals.entries = entries;
        next();
      }).catch(err => {
        console.log('Error finding entries at projectController.getAllEntries ' + err.message);
        next(err);
      }
      );
    }).catch(err => console.log('Error: projectController.getAllEntries error: ' + err.message));
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
          console.log(`projectController.createProject: Project title "${req.body.title}" already in use.`);
          // Add a rendered view for "Project already exists"
        } else {
          Project.create({
            title: req.body.title
          }).catch(err => {
            console.log('projectController.createProject Error: ' + err.message);
          });
        }
      }
    });
    next();
  },

  deleteEntry: (req, res, next) => {
    Entry.findByIdAndRemove(req.params.entryId)
    .then(() => {
      res.locals.redirect = req.params.projectId;
      next();
    })
    .catch(err => {
        console.log(`Error at projectController.deleteEntry: ${err.message}`);
      });
  },

  /**
   * Redirects based on res.locals.redirect path.
   */
  redirectPath: (req, res) => {
    res.redirect(`/projects/${res.locals.redirect}`);
  }
};