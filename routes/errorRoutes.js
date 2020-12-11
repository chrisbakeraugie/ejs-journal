const router = require('express').Router();
const errorController = require('../controllers/errorController');

router.use(errorController.pageNotFound);
router.use(errorController.internalServerError);

module.exports = router;