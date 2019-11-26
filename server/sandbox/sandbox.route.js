const express = require('express');
const sandboxCtrl = require('./sandbox.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(sandboxCtrl.simulate)


module.exports = router;
