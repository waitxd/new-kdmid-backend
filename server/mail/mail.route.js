const express = require('express');
const mailCtrl = require('./mail.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(mailCtrl.list)
  .post(mailCtrl.create);

router.route('/:country')
  .get(mailCtrl.get)
  .put(mailCtrl.update)
  .delete(mailCtrl.remove);

router.param('country', mailCtrl.load);

module.exports = router;
