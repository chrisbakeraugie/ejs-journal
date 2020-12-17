const User = require('../models/user');

module.exports ={
  createNewUser: (req, res, next) => {
    /** Current progress!
     *  *Created a basic new user view ine sjs
     *  *Created a usersController file
     *  *Created a created users router
     *  *Created a Users model/schema
     *  *Currently working on adding a createNew User method, which needs to check that the email values are
     *      unique (no duplicates) and work on creating a way to display projects limited to only the User's projects
     */
    User.exists({email : req.body.email}, function (err, doesExist) {
      if(err){
        console.log('userController.createUser error: ' + err);
        next();
      } else {
        if (doesExist) {
          console.log(`userController.createUser: User email "${req.body.email}" already in use.`);
          // Add a rendered view for "User already exists"
        } else {
          User.create({
            name: {
              first: req.body.firstName,
              middle: req.body.middleName,
              last: req.body.lastName
            },
            email: req.body.email
          }).then(user => {
            console.log(`User ${user.fullName} was created`);
            res.locals.redirect = 'new-user';
            next();
          }).catch(err => {
            console.log('projectController.createProject Error: ' + err.message);
          });
        }
      }
    });
  },

  newUserView: (req, res) => {
    res.render('newUser');
  },

   /**
   * Redirects based on res.locals.redirect path.
   */
  redirectPath: (req, res) => {
    res.redirect(`/users/${res.locals.redirect}`);
  }
};