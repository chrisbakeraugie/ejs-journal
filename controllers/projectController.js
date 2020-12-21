const Entry = require('../models/entry');
const Project = require('../models/project');
const User = require('../models/user');

module.exports = {

  /**
   * Checks whether a project title exists, and if it does, will not create a new one.
   * The .create is in callback to manage async behavior
   */
  createProject: (req, res, next) => {
    Project.exists({ title: req.body.title, owner: res.locals.currentUser._id }, function (err, doesExist) {
      if (err) {
        console.log('projectExists ' + err);
        return;
      } else {
        if (doesExist) {
          console.log(`projectController.createProject: Project title "${req.body.title}" already in use.`);
          // Add a rendered view for "Project already exists"
        } else {
          Project.create({
            title: req.body.title,
            owner: res.locals.currentUser._id
          })
            .then(project => {
              res.locals.redirect = '/'; // Redirects to the homepage
              User.findByIdAndUpdate(res.locals.currentUser._id, { $push: { projects: project._id }})
                .then(() => {
                  next();
                });
            })
            .catch(err => {
              console.log('projectController.createProject Error: ' + err.message);
            });
        }
      }
    });
    // Redirects if project already exists
    res.locals.redirect = '/projects';
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
   * local.entries variable to associate with ejs view
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
    }).catch(err => {
      console.log('Error: projectController.getAllEntries error: ' + err.message);
      next(err);
    });
  },

  /**
   * Uses the current logged in user id to find relevant projects,
   * and puts them in the res.locals object 
   */
  getAllProjects: (req, res, next) => {
    User.findById(res.locals.currentUser._id).then(user => {
      Project.find({
        '_id': { '$in': user.projects }
      }).then(projects => {
        res.locals.projects = projects;
        next();
      })
        .catch(err => {
          console.log('Error finding projects at projectController.getAllProjects ' + err.message);
          next(err);
        });
    }).catch(err => {
      console.log('Error: projectController.getAllProjects error' + err.message);
      next(err);
    });
  },

  /**
   * Accepts a URL parameter for id, 
   * and returns the entry in the res.locals object
   */
  getSingleEntry: (req, res, next) => {
    Entry.findById(req.params.entryId).then(entry => {
      res.locals.entry = entry;
      next();
    }).catch(err => {
      console.log('Error: projectController.showEditEntry ' + err.message);
      next(err);
    });
  },

  newProject: (req, res) => {
    res.render('project/newProject');
  },

  /**
   * Redirects based on res.locals.redirect path.
   */
  redirectPath: (req, res) => {
    res.redirect(res.locals.redirect);
  },

  /**
  * Renders the project page, which is currently a list of all submissions in order
  */
  showAllEntries: (req, res) => {
    res.render('project/project');
  },

  showAllProjects: (req, res) => {
    res.render('project/allProjects');
  },

  /**
   * Renders entry confirmation page
   */
  showCheckEntry: (req, res) => {
    res.render('project/checkEntry');
  },

  /**
   * Renders the editEntry view
   */
  showEditEntry: (req, res) => {
    res.render('project/editEntry');
  },

  /**
   * Finds entry to be updated by id, updates,
   * and returns the updated entry
   */
  updateEntry: (req, res, next) => {
    Entry.findByIdAndUpdate(req.params.entryId, {
      title: req.body.title,
      description: req.body.description
    }).then(entry => {
      res.locals.redirect = `/projects/${entry._id}/check-entry`;
      next();
    }).catch(err => {
      console.log('Error: projectController.updateEntry error ' + err.message);
      next(err);
    });
  }
};