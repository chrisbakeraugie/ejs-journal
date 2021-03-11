const User = require('../models/user');
const Project = require('../models/project');
const Entry = require('../models/entry');
const Confirmation = require('../models/confirmation');
const passport = require('passport');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const { credentials } = require('../config');
const genPassword = require('generate-password');
const filePath = require('path');
const ejs = require('ejs');

/**
 * 
 * @param {*} toAddr The address to send to
 * @param {*} fromAddr The address sending from (this will require credentials)
 * @param {*} subject Subject of email
 * @param {*} html The html to display in the email
 */
function sendhtmlEmail(toAddr, fromAddr, subject, html) {
  const transport = nodemailer.createTransport(
    nodemailerSendgrid({
      apiKey: credentials.sendgridApiKey
    })
  );
  transport.sendMail({
    from: fromAddr,
    to: toAddr,
    subject: subject,
    html: html
  }).catch(err => {
    console.log('nodemailer error : ' + err.message);
  });
}

module.exports = {

  authenticate: function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (info) {
        let infoArr = info.toString().split(': ');
        if (infoArr[0] === 'IncorrectPasswordError' || infoArr[0] === 'IncorrectUsernameError') {
          req.flash('warning', 'Incorrect password and/or email. Please try again');
        } else if (infoArr[0] === 'TooManyAttemptsError') {
          // eslint-disable-next-line quotes
          req.flash('danger', `Your account has been locked for too many failed attempts. Please use the 'Forgot Password' link`);
        } else {
          req.flash('warning', 'Login failed, please try again');
        }
      }
      if (err) {
        console.log(err + ' error');
        return next(err);
      }
      if (!user) {
        return res.redirect('/users/login');
      }
      req.logIn(user, function (err) {
        if (err) {
          console.log('error ' + err);
          return next(err);
        }
        req.flash('success', 'Welcome');
        return res.redirect('/projects');
      });
    })(req, res, next);
  },

  /**
   * @param confirmId is the confirmation document id
   * Checks that confirmation exists
   */
  checkConfirmation: (req, res, next) => {
    Confirmation.findById(req.params.confirmId).then(confirmation => {
      if (confirmation === null) {
        req.flash('warning', 'Account being confirmed not found. Your confirmation link may have expired; please sign up again.');
        res.redirect('/users/login');
      } else {
        res.locals.confirm = confirmation;
        next();
      }
    }).catch(err => {
      console.log('checkConfirmation Confirmation.findById error: ' + err.message);
      next(err);
    });
  },

  /**
   * Finds the user and confirms a matching tempKey value.
   * Then redirects if the key is expired,
   * passes if all criteria met
   */
  checkTempKey: (req, res, next) => {
    User.findOne({ _id: req.params.userId, 'tempKey.value': req.params.tempKey }).then(user => {
      if (user === null || user.tempKey.inUse === false) {
        res.redirect('/users/login');
      } else {
        if (user.tempKey.expDate < new Date()) {
          // eslint-disable-next-line quotes
          req.flash('warning', `Your reset request is more than 24 hours old. Please use 'Forgot Password' to try again.`);
          res.redirect('/users/forgot-password');
        } else {
          next();
        }
      }
    }).catch(() => {
      res.redirect('/users/login');
    });
  },

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
      res.locals.redirectPath = '/users/confirm/' + req.params.confirmId;
      next();
    } else {
      let newUser = new User({
        name: {
          first: req.body.firstName,
          middle: req.body.middleName,
          last: req.body.lastName
        },
        email: req.body.email,

        tempKey: {
          value: genPassword.generate({
            length: 20,
            numbers: false,
            symbols: false,
          }).toString(),
          inUse: false,
          expDate: new Date()
        }
      });

      User.register(newUser, req.body.newPassword, function (err, user) {
        if (err) {
          console.log('Error: usersController.createNewUser register error: ' + err.message);
          req.flash('danger', 'User account not created. Please try again');
          next(err);
        }
        if (user) {
          console.log(`Successfully created ${user.fullName}'s account.`);
          Confirmation.findByIdAndRemove(req.params.confirmId).catch(err => {
            console.log('Error: Confirmation removal error: ' + err.message);
          });
          req.flash('success', 'Account Created! Login, then visit the \'About\' page to learn about this website.');
          res.locals.redirectPath = '/users/login';
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
   * This checks the posted information against the current User collection
   * and confirms that a current user doesn't share that email. Then it sends a confirmation
   * link to the email for confirmation.
   */
  confirmUser: (req, res, next) => {
    if (res.locals.skip === true) {
      next();
    } else {
      User.findOne({ email: req.body.email }).then(user => {
        if (user) {
          req.flash('warning', 'That email is already registered.');
          res.locals.redirectPath = '/users/new-user';
          next();
        } else {
          Confirmation.create({
            name: {
              first: req.body.firstName,
              middle: req.body.middleName,
              last: req.body.lastName
            },
            email: req.body.email,

          }).then((doc) => {
            ejs.renderFile(filePath.join(__dirname, '../views/email/confirmation.ejs'), { docId: doc._id }, function (err, htmlStr) {
              if (err) {
                console.log('Error creating html string ' + err.message);
              } else {
                req.flash('success', 'Confirmation email has been sent!');
                res.locals.redirectPath = '/users/login';
                sendhtmlEmail(doc.email, credentials.fromSendgridEmail, 'Your Skriftr confirmation link', htmlStr);
                next();
              }
            });
          }).catch(err => {
            console.log('Confirmation User.find one error ' + err);
            next(err);
          });
        }
      }).catch(err => {
        console.log('confirmUser User.find one error ' + err);
        next(err);
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
  changePassword: (req, res, next) => {
    if (res.locals.skip === true) {
      res.locals.redirectPath = '/users/change-password';
      next();
    } else {
      User.findById(res.locals.currentUser._id).then((user) => {
        user.changePassword(req.body.currentPassword, req.body.newPassword, function (err) {
          if (err) {
            if (err.message === 'Password or username is incorrect') {
              res.locals.redirectPath = '/users/change-password';
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
        console.log('Error: changePassword User.findById: ' + err.message);
        next(err);
      });
    }
  },


  /**
   * Starts by sanitizing the email from the form, and checking that account exists
   * Once User doc found, tempKey is updated with 20 letter string, inUse = true, and an expiration date
   * Finally sends a link to the user informing them that their password can be resent 
   */
  sendRecoverEmail: (req, res, next) => {
    if (res.locals.skip === true) {
      res.locals.redirectPath = '/users/forgot-password';
      next();
    } else {


      User.exists({ email: req.body.email }, function (err, doc) {
        if (err) {
          console.log('sendRecoveryEmail exists error: ' + err.message);
          next(err);
        } else {
          if (doc === false) {
            req.flash('warning', 'Email address not found, please try again');
            res.locals.redirectPath = '/users/forgot-password';
            next();
          } else {
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + 1); // Takes current date and adds one day (24 hour expiration)
            User.findOneAndUpdate({ 'email': req.body.email }, {
              tempKey: {
                value: genPassword.generate({
                  length: 20,
                  numbers: false,
                  symbols: false,
                }),
                inUse: true,
                expDate: expDate
              }
              // eslint-disable-next-line no-unused-vars
            }, { new: true }, function (err, doc) { // Callback telling mongoose to execute update
              if (err) {
                console.log('Callback error ' + err.message);
                next(err);
              }
              ejs.renderFile(filePath.join(__dirname, '../views/email/forgot.ejs'), { docId: doc._id, tempKey: doc.tempKey.value }, function (err, htmlStr) {
                if (err) {
                  console.log('Error creating html string ' + err.message);
                } else {
                  req.flash('success', 'Confirmation email has been sent!');
                  res.locals.redirectPath = '/users/login';
                  sendhtmlEmail(doc.email, credentials.fromSendgridEmail, 'Skriftr account password reset', htmlStr);
                  req.flash('success', 'Please check your email for recovery email. It may take some time. Remember to check your spam folder!');
                  res.locals.redirectPath = '/users/login';
                  next();
                }
              });
            }).catch(err => {
              console.log('sendRecoverEmail findbyIdandUpdate error ' + err.message);
              next(err);
            });
          }
        }
      });
    }
  },

  /**
   * Skips if the validate middleware fails tells it too, redirects back to the page.
   * Otherwise, finds a user by id, uses passport-local-mongoose pluggins to resetAttempts,
   * set the new submitted password, then updates the User doc to remove the tempKey string and inUse to false.
   * Then passes on to redirect user to login page.
   * 
   */
  setPassword: (req, res, next) => {
    if (res.locals.skip === true) {
      res.locals.redirectPath = `/users/${req.params.userId}/${req.params.tempKey}`;
      next();
    } else {
      User.findById(req.params.userId).then(user => {
        user.resetAttempts(function (err) {
          if (err) {
            console.log('setPassword user.resetAttempts error ' + err.message);
            next(err);
          }
        });
        user.setPassword(req.body.newPassword, function (err) {
          if (err) {
            console.log('setPassword user.setPassword error ' + err.message);
            next(err);
          }
          user.save();
        });
      }).then(() => {
        User.findByIdAndUpdate(req.params.userId, {
          tempKey: {
            value: ' ',
            inUse: false
          }
          // eslint-disable-next-line no-unused-vars
        }, function (err) {
          if (err) {
            console.log('setPassword User.findbyIdandUpdate error ' + err.message);
            next(err);
          }
        }).then(() => {
          res.locals.redirectPath = '/users/login';
          req.flash('success', 'Password saved.');
          next();
        });
      }).catch(err => {
        console.log('setPassword User.findbyID error ' + err.message);
        next(err);
      });
    }
  },

  showCreatePassword: (req, res) => {
    res.locals.confirmId = req.params.confirmId;
    res.render('users/createPassword');
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

  showTempKey: (req, res) => {
    res.locals.userId = req.params.userId;
    res.locals.tempKey = req.params.tempKey;
    res.render('users/tempKey');
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
  showChangePassword: (req, res) => {
    res.render('users/changePassword');
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
      .withMessage('your password should have at least one special character')
      .matches(/[A-Za-z]/)
      .withMessage('your password must contain at lease one letter');
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
  validateEmail: (req, res, next) => {
    req.sanitizeBody('email')
      .normalizeEmail({
        all_lowercase: true
      })
      .trim();

    req.check('email', 'Entered email is invalid').isEmail();
    req.getValidationResult().then(err => {
      if (!err.isEmpty()) {
        let messages = err.array().map(e => e.msg);
        req.flash('warning', messages.join(' and '));
        res.locals.skip = true;
      }
      next();
    });
  }

};
