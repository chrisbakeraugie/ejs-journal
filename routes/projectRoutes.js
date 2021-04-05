const router = require('express').Router();
const projectController = require('../controllers/projectController');

router.get('', projectController.getAllProjects, projectController.showAllProjects);
router.get('/new-project', projectController.getAllProjects, projectController.newProject);
router.post('/new-project', projectController.projectValidate, projectController.createProject, projectController.redirectPath);
router.get('/:entryId/edit', projectController.authenticateUser, projectController.getSingleEntry, projectController.showEditEntry);
router.put('/:entryId/edit', projectController.authenticateUser, projectController.entryValidate, projectController.updateEntry, projectController.redirectPath);
router.get('/:projectId/data', projectController.authenticateUser, projectController.getAllEntries, projectController.getMoodData);
router.get('/:projectId', projectController.authenticateUser, projectController.getAllEntries, projectController.showAllEntries);
router.post('/:projectId', projectController.authenticateUser, projectController.entryValidate, projectController.entryPost, projectController.getAllEntries, projectController.showAllEntries);
router.get('/:projectId/delete-confirm', projectController.authenticateUser, projectController.getSingleProject, projectController.showDeleteConfirm);
router.delete('/:projectId/delete', projectController.authenticateUser, projectController.deleteProject, projectController.redirectPath);
router.delete('/:projectId/:entryId', projectController.authenticateUser, projectController.deleteEntry, projectController.redirectPath);

module.exports = router;