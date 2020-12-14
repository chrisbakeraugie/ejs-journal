const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.newProject);
router.get('/:id', projectController.getAllEntries, projectController.showAllEntries); // Move to bottom to prevent matching with everything
router.post('/:id', projectController.entryPost, projectController.getAllEntries, projectController.showAllEntries);

module.exports = router;