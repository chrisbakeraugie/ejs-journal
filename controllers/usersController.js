const User = require('../models/user');

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
    });
  //   User.exists({email : req.body.email}, function (err, doesExist) {
  //     if(err){
  //       console.log('userController.createUser error: ' + err);
  //       next();
  //     } else {
  //       if (doesExist) {
  //         console.log(`userController.createUser: User email "${req.body.email}" already in use.`);
  //         // Add a rendered view for "User already exists"
  //       } else {
  //         User.create({
  //           name: {
  //             first: req.body.firstName,
  //             middle: req.body.middleName,
  //             last: req.body.lastName
  //           },
  //           email: req.body.email
  //         }).then(user => {
  //           console.log(`User ${user.fullName} was created`);
  //           res.locals.redirect = '/users/new-user';
  //           next();
  //         }).catch(err => {
  //           console.log('projectController.createProject Error: ' + err.message);
  //         });
  //       }
  //     }
  //   });
  },

  newUserView: (req, res) => {
    res.render('newUser');
  },

   /**
   * Redirects based on res.locals.redirect path.
   */
  redirectPath: (req, res) => {
    res.redirect(res.locals.redirect);
  }
};