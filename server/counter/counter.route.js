const express = require('express');
const counterCtrl = require('./counter.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(counterCtrl.list)
  .post(counterCtrl.create);

router.route('/:counterId')
  .get(counterCtrl.get)
  .put(counterCtrl.update)
  .delete(counterCtrl.remove);

router.param('counterId', counterCtrl.load);

module.exports = router;
