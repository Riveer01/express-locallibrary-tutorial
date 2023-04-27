const express = require('express');
const router = express.Router();

// GET 请求主页
router.get('/', (req, res) => {
  res.redirect('/catalog');
});

module.exports = router;
