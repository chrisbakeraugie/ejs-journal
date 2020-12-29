const router = require('express').Router();
const projectRoutes = require('./projectRoutes');
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

module.exports = router;