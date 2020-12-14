const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('/new-entry', projectController.entryHome);
router.post('/new-entry', projectController.entryPost, projectController.entryHome);
router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.newProject);
router.get('/:id', projectController.getAllEntries, projectController.showAllEntries); // Move to bottom to prevent matching with everything

module.exports = router;