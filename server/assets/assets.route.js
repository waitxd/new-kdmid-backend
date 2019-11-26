const express = require('express');
const userCtrl = require('./assets.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** POST /api/users - Create new user */
  .post(userCtrl.create);

module.exports = router;
