const router = require('express').Router();
const usersController = require('../controllers/usersController');
const projectController = require('../controllers/projectController');

router.get('/login', usersController.showLogin);
router.post('/login', usersController.authenticate);
router.get('/logout', usersController.logout, usersController.redirectPath);
router.get('/new-user', usersController.newUserView);
router.post('/new-user', usersController.createNewUser, usersController.redirectPath);
router.use((req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect('/users/login');
  }
});
router.get('/profile', projectController.getAllProjects, projectController.getUserEntries, usersController.showUserProfile);
router.get('/reset-password', usersController.showResetPassword);
router.post('/reset-password', usersController.resetPassword, usersController.redirectPath);

module.exports = router;
