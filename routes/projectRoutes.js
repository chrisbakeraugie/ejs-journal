const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.newProject);
router.get('/:projectId', projectController.getAllEntries, projectController.showAllEntries); // Move to bottom to prevent matching with everything
router.post('/:projectId', projectController.entryPost, projectController.getAllEntries, projectController.showAllEntries);
router.delete('/:projectId/:entryId', projectController.deleteEntry, projectController.redirectPath);

module.exports = router;