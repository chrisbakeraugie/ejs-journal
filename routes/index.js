const router = require('express').Router();
const projectRoutes = require('./projectRoutes');
const errorRoutes = require('./errorRoutes');

router.use('/projects', projectRoutes);
router.use('/', errorRoutes);

module.exports = router;