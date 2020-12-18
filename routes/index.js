const router = require('express').Router();
const projectRoutes = require('./projectRoutes');
const errorRoutes = require('./errorRoutes');
const userRoutes = require('./userRoutes');

router.use('/users', userRoutes);
router.use((req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect('/users/login');
  }
});
router.use('/projects', projectRoutes);
router.use('/', errorRoutes);

module.exports = router;