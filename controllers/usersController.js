const User = require('../models/user');
const passport = require('passport');


module.exports = {

  authenticate: passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Login failed',
    successRedirect: '/',
    successFlash: 'Welcome'
  }),

  createNewUser: (req, res, next) => {
    if (res.locals.skip === true) {
      next();
    }
    let newUser = new User({
      name: {
        first: req.body.firstName,
        middle: req.body.middleName,
        last: req.body.lastName
      },
      email: req.body.email
    });

    User.register(newUser, req.body.password, function (err, user) {
      if (err) {
        console.log('Error: usersController.createNewUser register error: ' + err.message);
        req.flash('danger', 'User account not created. Please try again');
        next(err);
      }
      if (user) {
        console.log(`Successfully created ${user.fullName}'s account.`);
        req.flash('success', 'Account Created! Login, then visit the \'About\' page to learn about this website.');
        res.locals.redirectPath = '/';
        next();
      } else {
        console.log(`Error: Failed to create user account because: ${err.message}.`);
        req.flash('danger', 'User account not created. Please try again');
        res.locals.redirectPath = '/users/new-user';
        next();
      }
    });
    // Removed because this is not type Promise
    // .catch(err => {
    //   console.log('Error: usersController.createNewUser register error: ' + err.message);
    //   req.flash('danger', 'User account not created. Please try again');
    // });
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
    if (res.locals.redirectStatus) {
      res.redirect(res.locals.redirectStatus, res.locals.redirectPath);
    } else {
      res.redirect(res.locals.redirectPath);
    }
  },

  /**
   * Method to reset the password for an account. Uses the local-mongoose plugin
   * (see user model)
   */
  resetPassword: (req, res, next) => {
    if (res.locals.skip === true) {
      res.locals.redirectPath = '/users/reset-password';
      next();
    } else {
      User.findById(res.locals.currentUser._id).then((user) => {
        user.changePassword(req.body.currentPassword, req.body.newPassword, function (err) {
          if (err) {
            if (err.message === 'Password or username is incorrect') {
              res.locals.redirectPath = '/users/reset-password';
              req.flash('danger', 'Your current password was incorrect. Please try again.');
              next();
            }
            console.log('changePassword err: ' + err.message);
          } else {
            res.locals.redirectPath = '/users/profile';
            req.flash('success', 'New password has been saved');
            console.log('\n reset password');
            next();
            console.log('\n');
          }
        });
      }).catch(err => {
        console.log('Error: resetPassword User.findById: ' + err.message);
        next(err);
      });
    }
    /**
     * Progress 1/14/2021 - Successfully checks password on account creation.
     * Currently working on checking the password when being changed - check not working the same for some reason
     */
    // let skip = false;
    // req.check('newPassword')
    //   .isLength({ min: 8, max: 15 })
    //   .withMessage('your password should have min and max length between 8-15')
    //   .matches(/\d/)
    //   .withMessage('your password should have at least one number')
    //   .matches(/[!@#$%^&*(),.?":{}|<>]/)
    //   .withMessage('your password should have at least one special character');
    // req.getValidationResult().then(err => {
    //   if (!err.isEmpty()) {
    //     let messages = err.array().map(e => e.msg);
    //     req.flash('warning', messages.join(' and '));
    //     skip = true;
    //     res.locals.redirectPath = '/users/new-user';
    //   }
    // });

    // if(skip === true){
    //   next();
    // }

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
  },

  /**
   * Display reset password page
   */
  showResetPassword: (req, res) => {
    res.render('users/resetPassword');
  },

  /**
   * Checks that the password being submitted matches the requirements for a password
   * before passing it on to be used as the main password
   */
  validatePassword: (req, res, next) => {
    if(req.body.newPassword !== req.body.newPasswordConfirm){
      req.flash('danger', 'Your passwords did not match. Please try again.');
      res.locals.skip = true;
      next();
    }

    req.check('newPassword')
      .isLength({ min: 8, max: 15 })
      .withMessage('your password should have min and max length between 8-15')
      .matches(/\d/)
      .withMessage('your password should have at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('your password should have at least one special character');
    req.getValidationResult().then(err => {
      if (!err.isEmpty()) {
        let messages = err.array().map(e => e.msg);
        req.flash('warning', messages.join(' and '));
        res.locals.skip = true;
      }
      next();
    });
  },

  /**
   * This method "cleans" the data before it is passed to the createNewUser function,
   * which is vital in ensuring that data is uniform before submitting.
   */
  validateUser: (req, res, next) => {
    req.sanitizeBody('email')
      .normalizeEmail({
        all_lowercase: true
      })
      .trim();

    req.check('email', 'Email is invalid').isEmail();
    // req.check('password', 'Password cannot be empty').notEmpty();
    req.check('password')
      .isLength({ min: 8, max: 15 })
      .withMessage('your password should have min and max length between 8-15')
      .matches(/\d/)
      .withMessage('your password should have at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('your password should have at least one special character');
    // 
    req.getValidationResult().then(err => {
      if (!err.isEmpty()) {
        let messages = err.array().map(e => e.msg);
        req.flash('warning', messages.join(' and '));
        res.locals.skip = true;
        res.locals.redirectPath = '/users/new-user';
      }
      next();
    });
  }

};
