/**
 * Entry point to the journal app.
 * From here, the express app is created, the
 * app settings are customized, server is started,
 * and routes are introduced
 */
const express = require('express'); // Initialize our express app
const app = express(); 
const port = 3005; // Basic port setup. Updated later
const routes = require('./routes/index');

/**
 * This route will match with everything.
 * Because it will match with everything, it will
 * use the mainRoutes file, where we can separate are routes even further.
 * This keeps our main (journal.js) entry point easier to read.
 */
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
