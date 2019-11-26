const express = require('express');
const checkoutCtrl = require('./checkout.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** POST /api/checkout - Place order */
  .post(checkoutCtrl.create);

module.exports = router;
