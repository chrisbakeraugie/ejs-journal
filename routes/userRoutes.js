const router = require('express').Router();
const usersController = require('../controllers/usersController');
const projectController = require('../controllers/projectController');


router.get('/login', usersController.loggedInRedirect, usersController.showLogin);
router.post('/login', usersController.loggedInRedirect, usersController.authenticate);
router.get('/logout', usersController.logout, usersController.redirectPath);
router.get('/new-user', usersController.loggedInRedirect, usersController.newUserView);
router.post('/new-user', usersController.loggedInRedirect, usersController.validateUser, usersController.createNewUser, usersController.redirectPath);
router.get('/forgot-password', usersController.loggedInRedirect, usersController.showForgotPassword);
router.post('/forgot-password', usersController.loggedInRedirect, usersController.sendRecoverEmail, usersController.redirectPath);
router.get('/:userId/:tempKey', usersController.checkTempKey, usersController.showTempKey);
router.post('/:userId/:tempKey', usersController.validatePassword, usersController.setPassword, usersController.redirectPath);
router.use((req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect('/users/login');
  }
});
router.get('/profile', projectController.getAllProjects, projectController.getUserEntries, usersController.showUserProfile);
router.get('/change-password', usersController.showChangePassword);
router.post('/change-password', usersController.validatePassword, usersController.changePassword, usersController.redirectPath);
router.get('/delete-user', usersController.showDeleteUser);
router.post('/delete-user', usersController.confirmPassword, usersController.deleteUser, usersController.redirectPath);


module.exports = router;
