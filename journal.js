/**
 * Entry point to the journal app.
 * From here, the express app is created, the
 * app settings are customized, server is started,
 * and routes are introduced
 */
const express = require('express'); // Initialize our express app
const app = express();
const port = 3005; // Basic port setup. Updated later
const routes = require('./routes/index'); // Moving routes away from our main (journal.js) file
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose'); // Handles models/Schemas, connections to mongoDB
const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const errorController = require('./controllers/errorController');
const connectFlash  = require('connect-flash');
const methodOverride = require('method-override');// Required to handle different HTTP verbs like PUT or DELETE


/**
 * Use mongoose to connect to mongoDB
 * Change the connection string to use env variables in the future
 */
mongoose.connect('mongodb://localhost:27017/journal_db', { useNewUrlParser: true });
const db = mongoose.connection;
db.once('open', () => {
  console.log('\nConnection to mongoDB successful!\n');
});

/**
 * These adjustments to the app prepare the app for use
 * with an EJS layout. 
 */
app.set('view engine', 'ejs');
app.use(expressLayout);

/**
 * Tells the app to use the 'public' folder
 * for static files
 */
app.use(express.static('public'));

/**
 * Similar to body-parser, allows app to read the
 * req.body values when using forms (and does other things)
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Creating a session to be used by passportJS after login authentication
 */
app.use(cookieParser('longcomplicatedcode'));
app.use(expressSession({
  secret: 'longcomplicatedcode',
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // About two hours in milliseconds
  },
  resave: false,
  saveUninitialized: false
}));
app.use(connectFlash()); // Initializing flash messages

/**
 * The below is initializing the passportJS
 * strategy, and including the existing cookie session methods 
 */
app.use(passport.initialize());  // initializes passport
app.use(passport.session()); // Use the sessions included earlier

// Use the User model/schema for local strategy. Will be used for authentication
passport.use(User.createStrategy());
// Serial/deserial are complicated ways of delivering  the user model to a client safely
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/**
 * By using methodOverride, we can have more HTTP verb/methods.
 * This will enable DELETE and PUT verbs, for example
 */
app.use(methodOverride('_method', {
  methods: ['POST', 'GET']// The allowed methods the original request must be in to check for a method override value.
  // this can be considered a "security requirement".
  // let method = req.body._method;

}));

/**
 * This is middleware that will run every time, which reads the 
 * whether there is currently an authenticated user logged in,
 * and who that current user is. The locals variables will be accessible
 * every request, then deleted
 */
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessage = req.flash();

  // Array to be used for random images. NOT essential
  res.locals.randImgs = ['/img/0.jpg', '/img/1.jpg', '/img/2.jpg', '/img/3.jpg', '/img/4.jpg', '/img/5.jpg', '/img/6.jpg', '/img/7.jpg', '/img/8.jpg'];
  next();
});

/**
 * This route will render the homepage, and any other routes will match with
 * the app.use('/') below, including errors.
 */
app.get('/', (req, res) => {
  res.render('home');
});

/**
 * This route will match with everything.
 * Because it will match with everything, it will
 * use the mainRoutes file, where we can separate are routes even further.
 * This keeps our main (journal.js) entry point easier to read.
 */
app.use('/', routes);
/**
 * Handles errors, renders error pages
 */
app.use(errorController.respondNoResourceFound); // 404
app.use(errorController.respondInternalError); // 500

/**
 * Uses an integer value (port) and a callback
 * to start your server.
 */
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
