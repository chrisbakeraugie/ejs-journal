const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('/new-entry', projectController.entryHome);
router.post('/new-entry', projectController.entryPost, projectController.entryHome);
router.get('/project', projectController.getAllEntries, projectController.showAllEntries);
router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.newProject);

module.exports = router;