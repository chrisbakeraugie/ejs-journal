const User = require('../models/user');
const Project = require('../models/project');
const Entry = require('../models/entry');
const passport = require('passport');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const { credentials } = require('../config');
const genPassword = require('generate-password');

module.exports = {

  authenticate: passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Login failed',
    successRedirect: '/projects',
    successFlash: 'Welcome'
  }),

  /**
   * Checks that submitted password matches the password in the system,
   * setting 'skip' to 'true' if the user's password and submitted password don't match
   */
  confirmPassword: (req, res, next) => {
    User.findById(res.locals.currentUser._id).then(user => {
      user.authenticate(req.body.password, function (err, result) {
        if (err) {
          console.log('user authentication error ' + err.message);
          req.flash('danger', 'User account could not be deleted due to an error. Please try again');
          next(err);
        } else {
          if (result === false) {
            req.flash('danger', 'Password did not match. Please try again.');
            console.log('Password mismatch');
            res.locals.skip = true;
            res.locals.redirectPath = '/';
            next();
          } else {
            next();
          }
        }
      });
    }).catch(err => {
      console.log('usersController confirmPassword err: ' + err.message);
      next(err);
    });
  },

  createNewUser: (req, res, next) => {
    if (res.locals.skip === true) {
      next();
    } else {
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
    }
  },

  /**
   * Removes a user account from the users collection.
   * Then iterates through each project in a users account and removes it from the projects collection
   * Then iterates each entry that belongs  
   * 
   * TODO: Find a method to remove the nested forEach loops
   */
  deleteUser: (req, res, next) => {
    if (res.locals.skip === true) {
      next();
    } else {
      User.findByIdAndRemove(res.locals.currentUser._id).then((user) => {
        user.projects.forEach(project => {
          Project.findByIdAndRemove(project._id).then(project => {
            project.entries.forEach(entry => {
              Entry.findByIdAndRemove(entry._id).catch(err => {
                console.log(err.message);
              });
            });
          }).catch(err => {
            console.log(err.message);
          });
        });
        req.flash('success', 'User account successfully deleted');
        res.locals.redirectPath = '/';
        next();
      }).catch(err => {
        req.flash('danger', 'Error: User account NOT deleted');
        console.log('usersController deleteUser error: ' + err.message);
        next(err);
      });
    }


  },

  /**
   * Middleware that redirects users when the access resources that shouldn't be visible when logged in.
   */
  loggedInRedirect: (req, res, next) => {
    if (res.locals.loggedIn) {
      res.redirect('/projects');
    } else {
      next();
    }
  },

  /**
   * Controls the logout function.
   * req.logout() is exposed by PassportJS.
   * Invoking logout() will remove the req.user property 
   * and clear the login session (if any).
   */
  logout: (req, res, next) => {
    req.logout();
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
            next();
          }
        });
      }).catch(err => {
        console.log('Error: resetPassword User.findById: ' + err.message);
        next(err);
      });
    }
  },

  /**
   * Method starts by using express-validator on req parameter to sanitize the email.
   * It then searches for the email, redirecting and updating flash message if it is NOT found.
   * If email is found, it will generate a random password to send to the user, and saves the user model with
   *  the new password.
   * It finally redirects to the login page.
   */
  sendPasswordReset: (req, res, next) => {
    req.sanitizeBody('email')
      .normalizeEmail({
        all_lowercase: true
      }).trim();
    User.findOne({ 'email': req.body.email }).then(user => {
      if (user === null) {
        res.locals.redirectPath = '/users/forgot-password';
        req.flash('warning', `The email '${req.body.email}'  did not match any in the system. Please try again`);
        next();
      } else {
        const tempPass = genPassword.generate({
          length: 15,
          numbers: true,
          symbols: true,
        });
        user.setPassword(tempPass).then(() => {
          user.save();
          res.locals.redirectPath = '/users/login';
          req.flash('success', 'Temporary password has been sent');
          const transport = nodemailer.createTransport(
            nodemailerSendgrid({
              apiKey: credentials.sendgridApiKey
            })
          );

          transport.sendMail({
            from: credentials.fromSendgridEmail,
            to: user.email,
            subject: 'Password reset for Project Journal',
            html: `<h1>Howdy, here is your temporary password</h1>
          <br/>
          <p>${tempPass}</p>`
          }).catch(err => {
            console.log('nodemailer error : ' + err.message);
          });
          next();
        }).catch(err => {
          console.log('forgotPassword user setPassword err: ' + err.message);
          next(err);
        });
      }
    }).catch(err => {
      console.log('sendPassword reset error, User.findOne: ' + err);
      next(err);
    });
  },

  showDeleteUser: (req, res) => {
    res.render('users/deleteUser');
  },

  showForgotPassword: (req, res) => {
    res.render('users/sendResetPassword');
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
    if (req.body.newPassword !== req.body.newPasswordConfirm) {
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
