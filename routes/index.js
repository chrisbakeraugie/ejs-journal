const router = require('express').Router();

router.use('/', (req, res) => {
  res.send('A new route home');
});

module.exports = router;