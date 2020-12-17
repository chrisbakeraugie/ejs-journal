const router = require('express').Router();
const usersController = require('../controllers/usersController');

router.get('/new-user', usersController.newUserView);
router.post('/new-user', usersController.createNewUser, usersController.redirectPath);
module.exports = router;