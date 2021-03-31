const Entry = require('../models/entry');
const Project = require('../models/project');
const User = require('../models/user');
const httpStatus = require('http-status-codes');

module.exports = {

  /**
   * If there is information in the url, this middleware must be used in
   * order to prevent authenticated users from seeing OTHER authenticated users' information.
   */
  authenticateUser: (req, res, next) => {
    if (req.params.entryId) {
      Entry.findById(req.params.entryId).then(entry => {
        if (entry.owner.equals(res.locals.currentUser._id)) {
          next();
        } else {
          next(Error('Not Authorized'));
        }
      }).catch(err => {
        console.log('Error at authenticateUser - entry: ' + err.message);
        next(err);
      });
    } else if (req.params.projectId) {
      Project.findById(req.params.projectId).then(project => {
        if (project.owner.equals(res.locals.currentUser._id)) {
          next();
        } else {
          next(Error('Not Authorized'));
        }
      }).catch(err => {
        console.log('Error at authenticateUser - project: ' + err.message);
        next(err);
      });
    }
  },

  /**
   * Checks whether a project title exists, and if it does, will not create a new one.
   * The .create is in callback to manage async behavior
   */
  createProject: (req, res, next) => {
    Project.exists({ title: req.body.title, owner: res.locals.currentUser._id }, function (err, doesExist) {
      if (err) {
        console.log('projectExists ' + err);
        next(err);
        return;
      } else {
        if (doesExist) {
          console.log(`projectController.createProject: Project title "${req.body.title}" already in use.`);
          res.locals.redirectPath = '/projects/new-project';
          req.flash('danger', 'A project with that title already exists in your account. Please choose a unique title');
          next();

        } else {
          Project.create({
            title: req.body.title,
            description: req.body.description,
            owner: res.locals.currentUser._id
          })
            .then(project => {
              res.locals.redirectStatus = httpStatus.SEE_OTHER;
              res.locals.redirectPath = '/projects/' + project._id;
              User.findByIdAndUpdate(res.locals.currentUser._id, { $push: { projects: project._id } })
                .then(() => {
                  req.flash('success', 'Project successfully created');
                  next();
                });
            })
            .catch(err => {
              console.log('projectController.createProject Error: ' + err.message);
            });
        }
      }
    });
  },

  /**
   * Starts by removing the entry from the 'entry' collection.
   * Then removes the entry reference from the User collection.
   * Then removed the entry reference from the project collection.
   */
  deleteEntry: (req, res, next) => {
    Entry.findByIdAndRemove(req.params.entryId)
      .then((entry) => {
        User.findByIdAndUpdate(res.locals.currentUser._id, { $pull: { entries: entry._id } })
          .then(() => {
            Project.findByIdAndUpdate(req.params.projectId, { $pull: { entries: entry._id } }).catch(err => {
              console.log('' + err.message);
              next(err);
            });
          }).catch(err => {
            console.log('' + err.message);
            next(err);
          });
        res.locals.redirectStatus = httpStatus.SEE_OTHER;
        res.locals.redirectPath = '/projects/' + req.params.projectId;
        req.flash('success', 'Entry successfully deleted');
        next();
      }).catch(err => {
        console.log(`Error at projectController.deleteEntry: ${err.message}`);
        req.flash('danger', 'Error - Entry not deleted');
        next(err);
      });
  },

  /**
   * Starts by finding the project that is being deleted and removing it.
   * It then references the removed project so that the User that 'owns' it removes the project from the 
   * project array. Then, it iterates through each entry in that project, and removes them from the Entry collection and
   * from the User's 'entries' array.
   * 
   * TODO - These queries should be optimized. making a new query for each array is super inefficient and is hard to read. 
   */
  deleteProject: (req, res, next) => {
    Project.findByIdAndRemove(req.params.projectId).then((project) => {
      User.findByIdAndUpdate(res.locals.currentUser._id, { $pull: { projects: project._id } }).catch(err => {
        console.log('Error at User.findByIdAndUpdate of deleteProject: ' + err.message);
        next(err);
      });
      project.entries.forEach(entry => {
        Entry.findByIdAndRemove(entry._id).catch(err => {
          console.log('Error at Entry.findByIdAndRemove of deleteProject: ' + err.message);
          next(err);
        });

        User.findByIdAndUpdate(res.locals.currentUser._id, { $pull: { entries: entry._id } }).catch(err => {
          console.log('Error at User.findByIdAndUpdate entries of deleteProject: ' + err.message);
          next(err);
        });
      });
      req.flash('info', `The project '${project.title}' has been deleted`);
    }).then(() => {
      res.locals.redirectStatus = httpStatus.SEE_OTHER;
      res.locals.redirectPath = '/projects';
      next();
    }).catch(err => {
      console.log('Error at projectController.deleteProject: ' + err.message);
      req.flash('danger', 'Error - Project not deleted. Please wait and try again');
      next(err);
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
      writtenDate: Date.parse(req.body.clientInputDate),
      project: req.params.projectId,
      mood: req.body.mood,
      owner: res.locals.currentUser._id
    }).then(newEntry => {
      Project.findByIdAndUpdate(req.params.projectId, { $push: { entries: newEntry._id } }).catch(err => {
        console.log('projectController.entryPost Project update error ' + err.message);
        next(err);
      });
      User.findByIdAndUpdate(res.locals.currentUser._id, { $push: { entries: newEntry._id } }).then(() => {
        next();
      }).catch(err => {
        console.log('projectController.entryPost User update error ' + err.message);
        next(err);
      });
    }).catch(err => {
      console.log('projectController.entryPost error ' + err.message);
      next(err);
    });
  },

  /**
   * Starts by finding the project by id (in the url params),
   * finding entries associated to that project, and then uses the
   * local.entries variable to associate with ejs view
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

  getMoodData: (req, res) => {
    let entryData = [];
    res.locals.entries.forEach(entry => {
      entryData.push({
        date: entry.writtenDate,
        value: entry.mood
      });
    });
    res.locals.entries = entryData;
    res.render('project/moodData');
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

  getSingleProject: (req, res, next) => {
    Project.findById(req.params.projectId).then((project) => {
      res.locals.project = project;
      next();
    }).catch(err => {
      console.log('Error: projectController.getSingleProject findById error' + err.message);
    });
  },

  /**
   * This method references the current logged-in user, and finds all entries related to them.
   * 
   */
  getUserEntries: (req, res, next) => {
    User.findById(res.locals.currentUser._id).then(user => {
      Entry.find({
        '_id': { '$in': user.entries }
      }).then(entries => {
        res.locals.entries = entries;
        next();
      }).catch(err => {
        console.log('Error finding entries at projectController.getUserEntries ' + err.message);
        next(err);
      });
    }).catch(err => {
      console.log('Error: projectController.getUserEntries error' + err.message);
      next(err);
    });
  },

  newProject: (req, res) => {
    res.render('project/newProject');
  },

  /**
   * Redirects based on given status and path.
   * If only res.locals.redirectPath is clarified, it
   * will NOT change the original http method to redirect
   */
  redirectPath: (req, res) => {
    if (res.locals.redirectStatus) {
      res.redirect(res.locals.redirectStatus, res.locals.redirectPath);
    } else {
      res.redirect(res.locals.redirectPath);
    }
  },

  /**
  * Renders the project page, which is currently a list of all submissions in order
  */
  showAllEntries: (req, res) => {
    res.render('project/project');
  },

  showDeleteConfirm: (req, res) => {
    res.render('project/deleteConfirm');
  },

  showAllProjects: (req, res) => {
    res.render('project/allProjects');
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
      description: req.body.description,
      mood: req.body.mood
    }).then(entry => {
      res.locals.redirectPath = `/projects/${entry.project}`;
      req.flash('success', 'Entry updated successfully');
      next();
    }).catch(err => {
      console.log('Error: projectController.updateEntry error ' + err.message);
      req.flash('danger', 'Entry failed to update');
      next(err);
    });
  }
};