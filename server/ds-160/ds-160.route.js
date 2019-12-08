const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const ds160Ctrl = require('./ds-160.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/forwardEmail')
  .put(ds160Ctrl.forwardEmail)

router.route('/')
  /** GET /api/ds-160 - Get list of ds-160 applications */
  // .get(ds160Ctrl.list)

  /** POST /api/ds-160 - Create new ds-160 application */
  .post(validate(paramValidation.createApplication), ds160Ctrl.create);

router.route('/smlist')
  .get(ds160Ctrl.smlist)

router.route('/:applicationId')
  /** GET /api/ds-160/:applicationId - Get application by id */
  .get(ds160Ctrl.get)

  /** PUT /api/ds-160/:applicationId - Update application */
  .put(validate(paramValidation.updateApplication), ds160Ctrl.update)

  /** DELETE /api/ds-160/:applicationId - Delete application */
  .delete(ds160Ctrl.remove);

router.route('/completeOrder/:applicationId')
  .post(ds160Ctrl.completeOrder)

router.route('/automate/:applicationId')
  .get(ds160Ctrl.automate)

router.route('/sendEmail/sendLink/:applicationId')
  .post(ds160Ctrl.sendLinkEmail)

router.route('/sendEmail/:applicationId')
  .get(ds160Ctrl.sendEmail)

router.route('/status/:applicationId')
  .put(ds160Ctrl.updateStatus)

router.route('/updateKdmidId/:applicationId')
  .put(ds160Ctrl.updateKdmidId)

/** Load application when API with applicationId route parameter is hit */
router.param('applicationId', ds160Ctrl.load);

module.exports = router;
