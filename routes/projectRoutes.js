const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('', projectController.getAllProjects, projectController.showAllProjects);
router.get('/new-project', projectController.newProject);
router.post('/new-project', projectController.createProject, projectController.redirectPath);
router.get('/:entryId/check-entry', projectController.authenticateUser, projectController.getSingleEntry, projectController.showCheckEntry);
router.get('/:entryId/edit', projectController.authenticateUser, projectController.getSingleEntry, projectController.showEditEntry);
router.put('/:entryId/edit', projectController.authenticateUser, projectController.updateEntry, projectController.redirectPath);
router.get('/:projectId/data', projectController.authenticateUser, projectController.getAllEntries, projectController.getMoodData);
router.get('/:projectId', projectController.authenticateUser, projectController.authenticateUser, projectController.getAllEntries, projectController.showAllEntries); // Move to bottom to prevent matching with everything
router.post('/:projectId', projectController.authenticateUser, projectController.entryPost, projectController.getAllEntries, projectController.showAllEntries);
router.get('/:projectId/delete-confirm', projectController.authenticateUser, projectController.getSingleProject, projectController.showDeleteConfirm);
router.delete('/:projectId/delete', projectController.authenticateUser, projectController.deleteProject, projectController.redirectPath);
router.delete('/:projectId/:entryId', projectController.authenticateUser, projectController.deleteEntry, projectController.redirectPath);

module.exports = router;