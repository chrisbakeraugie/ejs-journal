const router = require('express').Router();
const projectRoutes = require('./projectRoutes');
const userRoutes = require('./userRoutes');

router.use('/users', userRoutes);
/**
 * About page is rendered here because the render function doesn't belong in
 * users or project controllers, and it should be public facing and before authorization.
 */
router.get('/about', (req, res) => {
  res.render('about');
});
router.use((req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect('/users/login');
  }
});
router.use('/projects', projectRoutes);

module.exports = router;