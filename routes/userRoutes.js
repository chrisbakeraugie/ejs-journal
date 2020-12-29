const router = require('express').Router();
const usersController = require('../controllers/usersController');
const projectController = require('../controllers/projectController');

router.get('/login', usersController.showLogin);
router.post('/login', usersController.authenticate);
router.get('/logout', usersController.logout, usersController.redirectPath);
router.use((req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect('/users/login');
  }
});
router.get('/profile', projectController.getAllProjects, usersController.showUserProfile);
router.get('/new-user', usersController.newUserView);
router.post('/new-user', usersController.createNewUser, usersController.redirectPath);
module.exports = router;