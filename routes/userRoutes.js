const router = require('express').Router();
const usersController = require('../controllers/usersController');

router.get('/login', usersController.showLogin);
router.post('/login', usersController.authenticate);
router.get('/logout', usersController.logout, usersController.redirectPath);
router.get('/new-user', usersController.newUserView);
router.post('/new-user', usersController.createNewUser, usersController.redirectPath);
module.exports = router;