const router = require('express').Router();
const entryController = require('../controllers/entryController');

router.get('/new-entry', entryController.entryHome);
router.post('/new-entry', entryController.entryPost, entryController.entryHome);

router.use('/', (req, res) => {
  res.send('A new route home');
});

module.exports = router;