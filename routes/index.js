const router = require('express').Router();
const entryController = require('../controllers/entryController');
const errorRoutes = require('./errorRoutes');

router.get('/new-entry', entryController.entryHome);
router.post('/new-entry', entryController.entryPost, entryController.entryHome);
router.get('/project', entryController.getAllEntries, entryController.showAllEntries);
router.get('/new-project', entryController.newProject);
router.post('/new-project', entryController.createProject, entryController.newProject);
// router.use('/', (req, res) => {
//   res.send('A new route home');
// });
router.use('/', errorRoutes);

module.exports = router;