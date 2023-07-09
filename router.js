const express = require('express')
const router = express.Router()
router.get('/', (req, res) => {
  res.send('server is up and running')
  console.log('connected')
})
module.exports = router
