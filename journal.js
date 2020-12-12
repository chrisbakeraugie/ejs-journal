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

/**
 * Use mongoose to connect to mongoDB
 * Change the connection string to use env variables in the future
 */
mongoose.connect('mongodb://localhost:27017/journal_db', {useNewUrlParser: true});
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
 * Similar to body-parser, allows app to read the
 * req.body values when using forms (and does other things)
 */
app.use(express.urlencoded({extended: true}));

/**
 * This route will render the homepage, and any other routes will match with
 * the app.use('/') below, including errors.
 */
app.get('/', (req, res) => {
  res.send('The homepage');
});

/**
 * This route will match with everything.
 * Because it will match with everything, it will
 * use the mainRoutes file, where we can separate are routes even further.
 * This keeps our main (journal.js) entry point easier to read.
 */
app.use('/', routes);

/**
 * Uses an integer value (port) and a callback
 * to start your server.
 */
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
