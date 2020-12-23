const User = require('../models/user');
const passport = require('passport');

module.exports ={

  authenticate: passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash :  'Login failed',
    successRedirect: '/',
    successFlash:  'Welcome'
  }),

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
        res.locals.redirectPath = '/';
        next();
      } else {
        console.log(`Error: Failed to create user account because: ${err.message}.`);
        req.flash('danger', 'User account not created. Please try again');
        res.locals.redirectPath = '/users/new-user';
        next();
      }
    }).catch(err => {
      console.log('Error: usersController.createNewUser register error: ' + err.message);
      req.flash('danger', 'User account not created. Please try again');
    });
  },

  
  /**
   * Controls the logout function.
   * req.logout() is exposed by PassportJS.
   * Invoking logout() will remove the req.user property 
   * and clear the login session (if any).
   */
  logout: (req, res, next) => {
    req.logout();
    // Add a flash message
    res.locals.redirectPath = '/';
    req.flash('info', 'Logged out');
    next();
  },

  newUserView: (req, res) => {
    res.render('users/newUser');
  },

   /**
   * Redirects based on given status and path.
   * If only res.locals.redirectPath is clarified, it
   * will NOT change the original http method to redirect
   */
  redirectPath: (req, res) => {
    if(res.locals.redirectStatus){
      res.redirect(res.locals.redirectStatus, res.locals.redirectPath);
    } else {
      res.redirect(res.locals.redirectPath);
    }
  },

  /**
   * Shows login form
   */
  showLogin: (req, res) => {
    res.render('users/loginUser');
  },

  /**
   * Display user information
   */
  showUserProfile: (req, res) => {
    res.render('users/userProfile');
  }
};