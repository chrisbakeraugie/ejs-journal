/**
 * Entry point to the journal app.
 * From here, the express app is created, the
 * app settings are customized, server is started,
 * and routes are introduced
 */
const express = require('express'); // Initialize our express app
const app = express();
// eslint-disable-next-line no-unused-vars
const { credentials } = require('./config');
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;
const routes = require('./routes/index'); // Moving routes away from our main (journal.js) file
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose'); // Handles models/Schemas, connections to mongoDB
const passport = require('passport');
const expressSession = require('express-session');
const MongodbStore = require('connect-mongodb-session')(expressSession);
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const errorController = require('./controllers/errorController');
const connectFlash = require('connect-flash');
const methodOverride = require('method-override');// Required to handle different HTTP verbs like PUT or DELETE
const expressValidator = require('express-validator');
const path = require('path');
const helmet = require('helmet');

/**
 * Use mongoose to connect to mongoDB
 * Change the connection string to use env variables in the future
 */
let cspDevelopment;

/**
 * Storage for express-session in production environment. 
 */
let cookieStore;

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-undef
  mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skriftrcloud.yrx80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true });

  cookieStore = new MongodbStore({
    // eslint-disable-next-line no-undef
    uri: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skriftrcloud.yrx80.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    collection: 'skriftSessions'
  });
  cookieStore.on('error', function (err) {
    console.log('cookieStore error: ' + err);
  });
} else {
  mongoose.connect('mongodb://localhost:27017/journal_db', { useNewUrlParser: true });

  //Adds localhost to safe domains (for development env ONLY)
  cspDevelopment = [`http://localhost:${port}/`];

  //express-session store value remains default 
  cookieStore = null;
}

const db = mongoose.connection;
db.once('open', () => {
  console.log('\nConnection to mongoDB successful!\n');
});


/**
 * Helmet.js for Express security. handles some better-known
 * HTTP header security issues.
 */
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    'default-src': ['\'self\''],
    'base-uri': ['\'self\''],
    'block-all-mixed-content': [],
    'font-src': ['\'self\'', 'https:', 'data:'],
    'frame-ancestors': ['\'self\''],
    'img-src': ['\'self\'', 'data:'],
    'object-src': ['\'none\''],
    'script-src': ['\'self\''].concat(cspDevelopment),
    'script-src-attr': ['\'none\''],
    'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
    'upgrade-insecure-requests': []
  }
}));

/**
 * These adjustments to the app prepare the app for use
 * with an EJS layout. 
 */
app.set('view engine', 'ejs');
// eslint-disable-next-line no-undef
app.set('views', path.join(__dirname + '/views'));
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
// eslint-disable-next-line no-undef
app.use(cookieParser(process.env.COOKIESECRET));
app.use(expressSession({
  // eslint-disable-next-line no-undef
  secret: process.env.COOKIESECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // About two hours in milliseconds
  },
  store: cookieStore,
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
 * Middleware to be used to 'clean' data that comes through express
 */
app.use(expressValidator());

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
  next();
});

/**
 * Redirect middleware that checks heroku's version of 
 */
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

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
  // eslint-disable-next-line no-undef
  console.log(`Server is running on ${port} and in environment '${process.env.NODE_ENV}'`);
});
