const express = require('express');
const router = express.Router();
const path = require('path')

/* GET users listing. */
router.get('/', function (req, res, next) {
  const filePath = path.resolve(__dirname, './index.js')
  res.sendFile(filePath)
  // res.send('respond with a resource');
});

router.get('/cool', (req, res, next) => {
  res.send('你好酷')
})

module.exports = router;
