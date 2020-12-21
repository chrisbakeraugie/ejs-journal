const User = require('../models/user');
const passport = require('passport');

module.exports ={
  createNewUser: (req, res, next) => {
    let newUser = new User({
      name: {
        first: req.body.firstName,
        middle: req.body.middleName,
        last: req.body.lastName
      },
      email: req.body.email
    });

    User.register(newUser, req.body.password, (err, user) => {
      if (user) {
        console.log(`Successfully created ${user.fullName}'s account.`);
        res.locals.redirect = '/';
        next();
      } else {
        console.log(`Error: Failed to create user account because: ${err.message}.`);
        res.locals.redirect = '/users/new-user';
        next();
      }
    }).catch(err => {
      console.log('Error: usersController.createNewUser register error: ' + err.message);
    });
  },

  authenticate: passport.authenticate('local', {
    failureRedirect: '/users/login',
    // failureFlash :  Add flash messages to inform user of status
    successRedirect: '/',
    // successFlash:  Add flash messages to inform user of status
  }),

  newUserView: (req, res) => {
    res.render('users/newUser');
  },

   /**
   * Redirects based on res.locals.redirect path.
   */
  redirectPath: (req, res) => {
    res.redirect(res.locals.redirect);
  },

  /**
   * Shows login form
   */
  showLogin: (req, res) => {
    res.render('users/loginUser');
  },

  /**
   * Controlls the logout function.
   * req.logout() is exposed by PassportJS.
   * Invoking logout() will remove the req.user property 
   * and clear the login session (if any).
   */
  logout: (req, res, next) => {
    req.logout();
    // Add a flash message
    res.locals.redirect = '/';
    next();
  }
};