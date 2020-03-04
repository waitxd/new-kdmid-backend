const DS160Application = require("./ds-160.model");
const addToQueue = require('../automation/DS-160').addToQueue

const normalize_ds160 = require('../format/DS-160').default
const requestIp = require('request-ip');
const https = require('https');
const querystring = require('querystring');
const Counter = require("../counter/counter.model");
const Mail = require("../mail/mail.model");
const constants = require('../utils/constants')
const APIError = require("../helpers/APIError")
const resendEmail = require('../email/resend')
const httpStatus = require("http-status")
const emailEngine = require("../email/index").engine
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const mongoose = require('mongoose');
const axios = require('axios');
const download_kdmid_status = require('../automation/kdmid_status/index')
const _ = require('lodash')

/**
 * Load application and append to req.
 */
function load(req, res, next, id) {
  DS160Application.get(id)
    .then(application => {
      req.application = application; // eslint-disable-line no-param-reassign
      next();
    })
    .catch(e => next(e));
}

/**
 * Get application
 * @returns {Application}
 */
function get(req, res) {
  return res.json(req.application);
}

/**
 * Automate application
 * @returns {Application}
 */
function automate(req, res) {
  const clientIp = req.clientIp;
  const application = req.application;
  let normalizedData = normalize_ds160(application.data)
  addToQueue({ 
    ...normalizedData, 
    _id: application._id, 
    app_id: application.app_id,
    agency: application.agency,
    ipaddr: application.ipaddr,
  })

  if(!application.history)
    application.history = []
  if(clientIp && !clientIp.startsWith(':'))
    application.history.push({
      function: 'automate',
      datetime: Date.now(),
      ipaddr: clientIp,
    })
  return application
    .save()
    .then(savedApplication => res.json(savedApplication))
    .catch(e => next(e));
}

/**
 * update automation status of application
 * @returns {Application}
 */
function updateStatus(req, res, next) {
  const application = req.application;
  const clientIp = req.clientIp;
  application.automation_status = req.body.automation_status;

  if(!application.history)
    application.history = []
  if(clientIp && !clientIp.startsWith(':'))
    application.history.push({
      function: 'updateStatus',
      datetime: Date.now(),
      ipaddr: clientIp,
    })
  return application
    .save()
    .then(savedApplication => res.json(savedApplication))
    .catch(e => next(e));
}


/**
 * update kdmid_id of application
 * @returns {}
 */
function updateKdmidId(req, res, next) {
  const application = req.application;
  application.kdmid_id = req.body.id;

  return application
    .save()
    .then(savedApplication => res.json({success: true}))
    .catch(e => next(e));
}

/**
 * get email_unique_number of application
 * @returns {}
 */
function getEmailUniqueNumber(req, res, next) {
  const application = req.application;

  return res.json({ number: application.email_unique_number })
}

/**
 * update email_unique_number of application
 * @returns {}
 */
function updateEmailUniqueNumber(req, res, next) {
  const application = req.application;
  application.email_unique_number = parseInt(req.body.number);

  return application
    .save()
    .then(savedApplication => res.json({success: true}))
    .catch(e => next(e));
}

/**
 * update confirm_link of application
 * @returns {}
 */
function updateConfirmLink(req, res, next) {
  const application = req.application;
  application.confirm_link = req.body.link;

  return application
    .save()
    .then(savedApplication => res.json({success: true}))
    .catch(e => next(e));
}

/**
 * get confirm_link of application
 * @returns {}
 */
function getConfirmLink(req, res, next) {
  const application = req.application;

  return res.json({ link: application.confirm_link })
}

function completeOrder(req, res, next) {
  const application = req.application;
  const clientIp = req.clientIp; 
  let normalizedData = normalize_ds160(application.data)
  addToQueue({ 
    ...normalizedData, 
    _id: req.application._id, 
    app_id: req.application.app_id,
    agency: req.application.agency,
    ipaddr: req.application.ipaddr,
  })

  application.transaction = req.body.json ? JSON.parse(req.body.json) : null
  if(!application.history)
    application.history = []
  if(clientIp && !clientIp.startsWith(':'))
    application.history.push({
      function: 'completeOrder',
      datetime: Date.now(),
      ipaddr: clientIp,
    })
  application
    .save()
    .then(savedApplication => {
      res.json(req.body)
    })
    .catch(e => next(e));
}

/**
 * Create new application
 * @property {string} req.body.email - The email address of application.
 * @property {string} req.body.completed - completed application or not.
 * @property {string} req.body.step_index - The index of step.
 * @property {object} req.body.data - The data of application.
 * @returns {Application}
 */
function create(req, res, next) {
  const clientIp = req.clientIp; 

  Counter.findByIdAndUpdate({_id: 'DS160_AppID'}, {$inc: { seq: 1} }, {new: true, upsert: true}, function(error, counter)   {
    if(error)
      return next(error);

    const application = new DS160Application({
      email: req.body.email,
      email_unique_number: 0,
      completed: req.body.completed,
      step_index: req.body.step_index,
      data: req.body.data,
      transaction: null,
      checkout_result: null,
      app_id: 'K' + counter.seq,
      agency: req.body.agency,
      ipaddr: clientIp
    });

    if(req.body.withoutPayment) {
      let normalizedData = normalize_ds160(application.data)
      addToQueue({ 
        ...normalizedData, 
        _id: application._id, 
        app_id: application.app_id,
        agency: application.agency,
        ipaddr: clientIp
      })

    }
    if(!application.history)
      application.history = []
    if(clientIp && !clientIp.startsWith(':'))
      application.history.push({
        function: 'create',
        datetime: Date.now(),
        ipaddr: clientIp,
        withoutPayment: req.body.withoutPayment
      })
    application
      .save()
      .then(savedApplication => res.
        json(savedApplication))
      .catch(e => next(e));
  });
  
}

/**
 * Update existing application
 * @property {string} req.body.email - The email address of application.
 * @property {string} req.body.completed - completed application or not.
 * @property {string} req.body.step_index - The index of step.
 * @property {object} req.body.data - The data of application.
 * @returns {Application}
 */
function update(req, res, next) {
  const clientIp = req.clientIp; 
  const application = req.application;
  application.email = req.body.email;
  application.completed = req.body.completed;
  application.step_index = req.body.step_index;
  application.data = req.body.data;
  application.agency = req.body.agency;

  if(req.body.withoutPayment) {
    let normalizedData = normalize_ds160(application.data)
    addToQueue({ 
      ...normalizedData, 
      _id: application._id, 
      app_id: application.app_id,
      agency: application.agency,
      ipaddr: application.ipaddr
    })
  }

  if(!application.history)
    application.history = []
  if(clientIp && !clientIp.startsWith(':'))
    application.history.push({
      function: 'update',
      datetime: Date.now(),
      ipaddr: clientIp,
      withoutPayment: req.body.withoutPayment
    })
  application.markModified('history')

  application
    .save()
    .then(savedApplication => res.json(savedApplication))
    .catch(e => next(e));
}

/**
 * Get application list.
 * @property {number} req.query.skip - Number of applications to be skipped.
 * @property {number} req.query.limit - Limit number of applications to be returned.
 * @returns {Application[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  DS160Application.list({ limit, skip })
    .then(applications => res.json(applications))
    .catch(e => next(e));
}

/**
 * Get application list with necessary fields.
 * @property {number} req.body.skip - Number of applications to be skipped.
 * @property {number} req.body.limit - Limit number of applications to be returned.
 * @returns {Application[]}
 */
function smlist(req, res, next) {
  const { limit = 10, skip = 0, checkout, automation_status, search, agency } = req.query;

  let decoded = null
  let finalCond = []

  try {
    decoded = jwt.verify(req.token, config.jwtSecret);
  } catch (e) {
    return res.status(401).send('unauthorized');
  }

  if(decoded.role == constants.USER_ROLE.AGENCY) {
    finalCond.push({ "agency": decoded.username })
  } else if (decoded.role == constants.USER_ROLE.ADMIN) {

  } else {
    return res.status(401).send('unauthorized');
  }

  if(agency) {
    if(agency == 'none') {
      finalCond.push({ "agency": null })
    } else {
      finalCond.push({ "agency": agency })
    }
  }

  if(search) {
    let conditions = [ 
      { "app_id": search },
      { "kdmid_id": search },
      { "data.personal.surname": { $regex: search, $options: "i" } },
      { "data.personal.firstnames": { $regex: search, $options: "i" } },
      { "data.register.email": { $regex: search, $options: "i" } },
    ]

    if(mongoose.Types.ObjectId.isValid(search))
      conditions.push({ "_id": search })

    finalCond.push({ $or: conditions })
  }
  if(checkout) {
    let conditions = []
    checkout.split(",").forEach(value => {
      switch(value) {
        case 'not_completed':
          conditions.push({ 'completed': false })
          break;
        case 'not_paid':
          conditions.push({ 'completed': true, 'transaction': {$in: [null, undefined]} })
          break;
        case 'paid':
          conditions.push({ 'completed': true, 'transaction': {$ne: null} })
          break;
      }
    })
    if(conditions.length)
      finalCond.push({ $or: conditions })
  }
  if(automation_status) {
    let conditions = []
    automation_status.split(",").forEach(value => {
      switch(value) {
        case 'not_completed':
          conditions.push({ 'completed': false })
          break;
        case 'pending':
          conditions.push({ 'completed': true, 'automation_status': {$in: [null, undefined]} })
          break;
        case 'in_progress':
          conditions.push({ 'completed': true, 'automation_status.result': 'processing' })
          break;
        case 'failed':
          conditions.push({ 'completed': true, $or: [{'automation_status.result': 'fail'}, {'automation_status.error': {$ne: null}}]})
          break;
        case 'not_sent':
          conditions.push({ 'completed': true, 'automation_status.result': 'success', 'automation_status.email_status': false})
          break;
        case 'success':
          conditions.push({ 'completed': true, 'automation_status.result': 'success', 'automation_status.email_status': {$ne: false}})
          break;
      }
    })
    if(conditions.length)
      finalCond.push({ $or: conditions})
  }

  DS160Application.countDocuments( finalCond.length ? {$and: finalCond}: {}, function(err, total) {
    DS160Application.smlist({ limit, skip, filters: finalCond.length ? {$and: finalCond}: {} })
    .then(applications => {
      let results = applications.map(application => {
        return {
          _id: application._id,
          app_id: application.app_id,
          kdmid_id: application.kdmid_id,
          completed: application.completed,
          paid: application.transaction ? true : false,
          surname: _.get(application, 'data.personal.surname'),
          firstnames: _.get(application, 'data.personal.firstnames'),
          citizenCode: _.get(application, 'data.start.citizenCode'),
          transaction: application.transaction,
          checkout_result: application.checkout_result,
          email: _.get(application, 'data.register.email'),
          // password: application.data.register.password,
          createdAt: application.createdAt,
          automation_status: application.automation_status,
          agency: application.agency,
          ipaddr: application.ipaddr
        }
      })
      res.json({ list: results, total: total })
    })
    .catch(e => next(e));
  })
  
}

/**
 * Delete application.
 * @returns {Application}
 */
function remove(req, res, next) {
  const application = req.application;
  application
    .remove()
    .then(deletedApplication => res.json(deletedApplication))
    .catch(e => next(e));
}

/**
 * Send Email
 * @returns {Application}
 */
function sendEmail(req, res) {
  const clientIp = req.clientIp
  const application = req.application

  const location = application.data.interview_location
  const cntryIndex = constants.countries_option_value_list.findIndex(value => value == location)
  const country = constants.countries_option_label_list[cntryIndex].split(',')[0]

  Mail.findOne({ country: new RegExp(country,"i") })
      .exec()
      .then(async mail => {
        try {
          if (mail) {
            await resendEmail(application, { data: mail })

            application.automation_status = {
              result: "success",
              email_status: true,
              error: null
            }

            if(!application.history)
              application.history = []
            if(clientIp && !clientIp.startsWith(':'))
              application.history.push({
                function: 'sendEmail',
                datetime: Date.now(),
                ipaddr: clientIp,
              })
            application
              .save()
              .then(savedApplication => {})
              .catch(e => next(e));

            return res.json(mail)
          }
          const err = new APIError("No such mail template exists!", httpStatus.NOT_FOUND);
          return res.json(err);
        } catch (error) {
          return res.json({ status: 500, error })
        }
      });

  // return res.json(req.application);
}

function extractLinkFromConfirmEmail(textAsHtml) {
  let start = textAsHtml.indexOf('[')
  let end = textAsHtml.indexOf(']')
  if (start < 0 || end < 0)
    return null
  const atag = textAsHtml.slice(start + 1, end)
  
  start = atag.indexOf('>')
  end = atag.lastIndexOf('<')
  
  if (start < 0 || end < 0)
    return null
    
  return  atag.slice(start + 1, end)
}

/**
 * Forward Email from travel-group.org
 * @returns {}
 */
function forwardEmail(req, res) {

  const email = req.body.to.text

  console.log(email, req.body.subject, req.body.textAsHtml, req.body.attachments)

  const subject = req.body.subject
  const textAsHtml = req.body.textAsHtml

  const app_id = email.split('@')[0].split('-')[1]

  console.log(app_id)

  if (!app_id) {
    return res.json({ status: 'failed', err: 'app_id is wrong' })
  }

  DS160Application.findOne({ app_id: app_id })
    .exec()
    .then((application) => {
      if (!application) {
        // Junk Emails
        return res.json({ status: 'failed', err: 'Junk Email' })
      }
      let customer_email = null
      customer_email = application.data.register.email
      console.log('Customer email: ', customer_email)

      if (subject.startsWith('e-visa notification')) {
        emailEngine(
          customer_email,
          "admin@evisa-russia-online.com",
          req.body.subject,
          req.body.textAsHtml,
          req.body.attachments,
          "admin@usa-visas-services.com"
        )
          .then(() => {
            console.log(`Successed to send email to Admin(admin@usa-visas-services.com) & Customer(${customer_email}).`)
            return emailEngine(
              "jimdevcare@gmail.com",
              "admin@evisa-russia-online.com",
              req.body.subject,
              req.body.textAsHtml,
              req.body.attachments,
            )
          })
          .then(() => {
            console.log(`Successed to send email to Developer(jimdevcare@gmai.com)`)
            return res.json({ status: 'success' })
          })
          .catch(err => {
            console.log('Failed to Send email!!!', err)
            return res.json({ status: 'failed', err })
          })
      } else {
        if (subject.startsWith('Please confirm your email for registration')) {
          const link = extractLinkFromConfirmEmail(textAsHtml)

          if (!link) {
            console.log(`Failed to extract Link from email`)
            return res.json({ status: 'failed', err: 'Failed to extract Link from email'})
          } else {
            application.confirm_link = link
            application
            .save()
            .then(savedApplication => {
              console.log('success to save confirm link')
              return res.json({ status: 'success' })
            })
            .catch(e => {
              console.log('failed to save confirm link')
              return res.json({ status: 'failed', err: 'failed to set confirm_link' })
            });
          }
        } else {
          emailEngine(
            "jimdevcare@gmail.com",
            "admin@evisa-russia-online.com",
            req.body.subject,
            req.body.textAsHtml,
            req.body.attachments,
          )
          .then(() => {
            console.log(`Successed to send email to Developer(jimdevcare@gmai.com)`)
            return res.json({ status: 'success' })
          })
          .catch(err => {
            console.log('Failed to Send email!!!', err)
            return res.json({ status: 'failed', err })
          })
        }
      }
    })
}

/**
 * Send Link Email
 * @returns {Application}
 */
function sendLinkEmail(req, res) {
  const application = req.application
  if(req.body.email) {
    emailEngine(
      req.body.email,
      "admin@evisa-russia-online.com",
      "Link to continue Russian e-visa Online Application",
      `Thank you for saving Russian e-visa Online Application. Please use the unique link below to return to the form from any computer. <br/><br/> https://kdmid-evisa.com/visa/application-form/token=${application._id} <br/><br/> Remember that the link will expire after 30 days so please return via the provided link to complete your form submission.`,
      []
    ).then(result => {
      return res.json({ status: 'success' })
    }).catch(err => {
      return res.json({ status: 'failed', err })
    })
  } else {
    return res.json({ status: 'failed' })
  }
}

/**
 * Get Kdmid Status
 * @returns {Status}
 */
function getKdmidStatus(req, res) {
  const application = req.application
  const kdmid_id = application.kdmid_id
  const password = application.data.register.password

  console.log('getKdmidStatus: ', kdmid_id, password)

  if(application.kdmid_status && application.kdmid_status.Status === 1) {
    return res.json(application.kdmid_status)
  }

  axios.post(`https://evisa.kdmid.ru/en-US/Account/CheckStatus`, {
    "locale":"en-US","AppId":kdmid_id,"Password":password,"Status":null,"StatusDescription":null,"FullDescription":"","AppModel":null,"CheckInProgress":true,"ResponseTimestamp":null,"checkButtonDisabled":true,"_statusPanelVisible":false,"_cssWarning":true,"_cssDanger":false,"_loadDecisionVisible":false
  }, {headers: {"Content-Type": "application/json"}})
  .then(async (response) => {
    application.kdmid_status = {...response.data}

    if(application.kdmid_status.Status === 1) {
      await download_kdmid_status.process(null, application)
    }

    return application.save()
  })
  .then(() => res.json(application.kdmid_status))
  .catch(err => {
    console.log('Error', err)
    return res.json(new APIError(err, httpStatus.NOT_FOUND));
  })
}

module.exports = { 
  load, 
  get, 
  create, 
  update, 
  list, 
  remove, 
  automate, 
  smlist, 
  updateStatus, 
  completeOrder, 
  sendEmail, 
  sendLinkEmail,
  forwardEmail,
  updateKdmidId,
  getKdmidStatus,
  updateEmailUniqueNumber,
  getEmailUniqueNumber,
  updateConfirmLink,
  getConfirmLink,
};
