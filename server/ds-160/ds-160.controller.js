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

class DirectPost {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  setBilling(billingInformation) {
    // Validate that passed in information contains valid keys
    const validBillingKeys = ['first_name', 'last_name', 'company', 'address1', 
        'address2', 'city', 'state', 'zip', 'country', 'phone', 'fax', 'email'];

    for (let key in billingInformation) {
      if (!validBillingKeys.includes(key)) {
        throw new Error(`Invalid key provided in billingInformation. '${key}' 
            is not a valid billing parameter.`)
      }
    };

    this.billing = billingInformation; 
  }

  setShipping(shippingInformation) {
    // Validate that passed in information contains valid keys
    const validShippingKeys = [
      'shipping_first_name', 'shipping_last_name', 'shipping_company', 
      'shipping_address1', 'address2', 'shipping_city', 'shipping_state', 
      'shipping_zip', 'shipping_country', 'shipping_email'
    ];

    for (let key in shippingInformation) {
      if (!validShippingKeys.includes(key)) {
        throw new Error(`Invalid key provided in shippingInformation. '${key}' 
            is not a valid shipping parameter.`)
      }
    };

    this.shipping = shippingInformation; 
  }

  doSale(amount, ccNum, ccExp, cvv) {

    return new Promise((resolve, reject) => {
      let postData = {
        'type': 'sale',
        'amount': amount,
        'ccnumber': ccNum,
        'ccexp': ccExp,
        'cvv': cvv
      };
  
      // Merge together all request options into one object
      // Object.assign(postData, this.billing, this.shipping);
      Object.assign(postData, this.billing);
  
      const hostName = 'secure.networkmerchants.com';
      const path = '/api/transact.php';

      postData.username = this.username;
      postData.password = this.password;
      postData = querystring.stringify(postData);

      const options = {
        hostname: hostName,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      // Make request to Direct Post API
      const req = https.request(options, (response) => {
        // console.log(`STATUS: ${response.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

        response.on('data', (chunk) => {
          // console.log(chunk);
          let terms = Buffer.from(chunk).toString().split('&')
          let result = {}
          for(let i = 0; i < terms.length; i++) {
              let keyValue = terms[i].split('=')
              let key = keyValue[0]
              let value = keyValue[1] ? keyValue[1] : ''
              result[key] = value
          }
          resolve(result)
        });
        // response.on('end', () => {
        //   console.log('No more data in response.');
        // });
      });

      req.on('error', (e) => {
          reject(e)
      });

      // Write post data to request body
      req.write(postData);
      req.end();
    })
    
  }
}

/**
 * Load application and append to req.
 */
function load(req, res, next, id) {
  DS160Application.get(id)
    .then(application => {
      req.application = application; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get application
 * @returns {Application}
 */
function get(req, res) {
  // let normalizedData = normalize_ds160(req.application.data)
  // addToQueue(normalizedData)
  return res.json(req.application);
}

/**
 * Automate application
 * @returns {Application}
 */
function automate(req, res) {
  const clientIp = requestIp.getClientIp(req); 
  let normalizedData = normalize_ds160(req.application.data)
  addToQueue(normalizedData, req.application._id, req.application.app_id, clientIp)
  return res.json(req.application);
}

/**
 * update automation status of application
 * @returns {Application}
 */
function updateStatus(req, res) {
  const application = req.application;
  application.automation_status = req.body.automation_status;

  application
    .save()
    .then(savedApplication => res.json(savedApplication))
    .catch(e => next(e));
}

function completeOrder(req, res, next) {
  const application = req.application;
  const clientIp = requestIp.getClientIp(req); 
  let normalizedData = normalize_ds160(application.data)
  addToQueue(normalizedData, application._id, application.app_id, clientIp)
  application.transaction = req.body.json ? JSON.parse(req.body.json) : null
  // application.checkout_result = {...checkout_result}
  console.log(req.body)
  application
    .save()
    .then(savedApplication => {
      // console.log('Saved: ', savedApplication.transaction)
      res.json(req.body)
    })
    .catch(e => next(e));
}

/**
 * Checkout for application
 * @returns {Application}
 */

function checkout(req, res, next) {
  const clientIp = requestIp.getClientIp(req); 
  const dp = new DirectPost(process.env.NMI_Username, process.env.NMI_Password);
  const billingInfo = {
      'first_name': req.body.data.surname,
      'last_name': req.body.data.given_name,
      'address1': req.body.data.address,
      'city': req.body.data.city,
      'state': req.body.data.state,
      'zip' : req.body.data.zip,
      'phone': req.body.data.phone
  }

  dp.setBilling(billingInfo);
  try {
    const application = req.application;

    dp.doSale('165.00', req.body.data.ccNum, req.body.data.ccExp, req.body.data.ccv)
      .then(checkout_result => {
        let normalizedData = normalize_ds160(application.data)
        addToQueue(normalizedData, application._id, application.app_id, clientIp)
        application.transaction = {...req.body.data}
        application.checkout_result = {...checkout_result}
        application
          .save()
          .then(savedApplication => {
            console.log('Saved: ', savedApplication.transaction)
            res.json(checkout_result)
          })
          .catch(e => next(e));
      })
      .catch(e => next(e)) 
  } catch (e) {
      next(e)
  }
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
  const clientIp = requestIp.getClientIp(req); 

  Counter.findByIdAndUpdate({_id: 'DS160_AppID'}, {$inc: { seq: 1} }, {new: true, upsert: true}, function(error, counter)   {
    if(error)
      return next(error);

    const application = new DS160Application({
      email: req.body.email,
      completed: req.body.completed,
      step_index: req.body.step_index,
      data: req.body.data,
      transaction: null,
      checkout_result: null,
      app_id: counter.seq
    });

    if(req.body.withoutPayment) {
      let normalizedData = normalize_ds160(application.data)
      addToQueue(normalizedData, application._id, application.app_id, clientIp)
    }
  
    application
      .save()
      .then(savedApplication => res.json(savedApplication))
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
  const clientIp = requestIp.getClientIp(req); 
  const application = req.application;
  application.email = req.body.email;
  application.completed = req.body.completed;
  application.step_index = req.body.step_index;
  application.data = req.body.data;

  if(req.body.withoutPayment) {
    let normalizedData = normalize_ds160(application.data)
    addToQueue(normalizedData, application._id, application.app_id, clientIp)
  }

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
  const { limit = 10, skip = 0 } = req.query;
  DS160Application.count({}, function(err, total) {
    DS160Application.list({ limit, skip })
    .then(applications => {
      let results = applications.map(application => {
        const cntryIndex = constants.countries_option_value_list.findIndex(value => value == application.data.interview_location)
        const interview_location = constants.countries_option_label_list[cntryIndex]
        return {
          _id: application._id,
          app_id: application.app_id,
          completed: application.completed,
          paid: application.transaction ? true : false,
          surname: application.data.form_personal_info.surname,
          given_name: application.data.form_personal_info.given_name,
          location: interview_location,
          transaction: application.transaction,
          checkout_result: application.checkout_result,
          email: application.data.form_addr_and_phone.email,
          createdAt: application.createdAt,
          automation_status: application.automation_status
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

/**
 * Send Link Email
 * @returns {Application}
 */
function sendLinkEmail(req, res) {
  const application = req.application
  if(req.body.email) {
    emailEngine(
      req.body.email,
      "support@usa-visas-services.com",
      "Link to continue DS-160 Non-Immigrant US Visa Application",
      `Thank you for saving DS-160 Non-Immigrant US Visa Application. Please use the unique link below to return to the form from any computer. <br/><br/> https://ds-160.us/ds-160/application-form/token=${application._id} <br/><br/> Remember that the link will expire after 30 days so please return via the provided link to complete your form submission.`,
      null
    ).then(result => {
      return res.json({ status: 'success' })
    }).catch(err => {
      return res.json({ status: 'failed', err })
    })
  } else {
    return res.json({ status: 'failed' })
  }
}

module.exports = { 
  load, 
  get, 
  create, 
  update, 
  list, 
  remove, 
  automate, 
  checkout, 
  smlist, 
  updateStatus, 
  completeOrder, 
  sendEmail, 
  sendLinkEmail
};
