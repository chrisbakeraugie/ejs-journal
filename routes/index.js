const router = require('express').Router();
const projectRoutes = require('./projectRoutes');
const errorRoutes = require('./errorRoutes');
const userRoutes = require('./userRoutes');

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/', errorRoutes);

module.exports = router;