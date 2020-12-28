const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('', projectController.getAllProjects, projectController.showAllProjects);
router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.redirectPath);
router.get('/:entryId/check-entry', projectController.getSingleEntry, projectController.showCheckEntry);
router.get('/:entryId/edit', projectController.getSingleEntry, projectController.showEditEntry);
router.put('/:entryId/edit', projectController.updateEntry, projectController.redirectPath);
router.get('/:projectId/data', projectController.getAllEntries, projectController.getMoodData);
router.get('/:projectId', projectController.getAllEntries, projectController.showAllEntries); // Move to bottom to prevent matching with everything
router.post('/:projectId', projectController.entryPost, projectController.getAllEntries, projectController.showAllEntries);
router.delete('/:projectId/:entryId', projectController.deleteEntry, projectController.redirectPath);

module.exports = router;