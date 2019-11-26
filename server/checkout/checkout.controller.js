const https = require('https');
const querystring = require('querystring');

// api-key: 33VXpybqM7Bs927UJN4US5WA2xJNYZJT

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

  doSale(res, amount, ccNum, ccExp, cvv) {
    let requestOptions = {
      'type': 'sale',
      'amount': amount,
      'ccnumber': ccNum,
      'ccexp': ccExp,
      'cvv': cvv
    };

    // Merge together all request options into one object
    // Object.assign(requestOptions, this.billing, this.shipping);
    Object.assign(requestOptions, this.billing);

    // Make request
    this._doRequest(res, requestOptions);
  }

  _doRequest(res, postData) {
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
      console.log(`STATUS: ${response.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

      response.on('data', (chunk) => {
        console.log(chunk);
        let terms = Buffer.from(chunk).toString().split('&')
        let result = {}
        for(let i = 0; i < terms.length; i++) {
            let keyValue = terms[i].split('=')
            let key = keyValue[0]
            let value = keyValue[1] ? keyValue[1] : ''
            result[key] = value
        }
        res.json(result)
      });
      response.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
        throw e;
    });

    // Write post data to request body
    req.write(postData);
    req.end();
  }
}


/**
 * Create new user
 * @property {string} req.body.fullname - The fullname of user.
 * @property {string} req.body.email - The email address of user.
 * @returns {`User}
 */
function create(req, res, next) {
    // Set dummy data for sale
    const dp = new DirectPost('demo', 'password');
    // const dp = new DirectPost('JasonDev', 'jm03120622');
    console.log(req.body)
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
    // dp.doSale('165.00', '4111111111111111', '1221', '123');
    try {
        dp.doSale(res, '165.00', req.body.data.ccNum, req.body.data.ccExp, req.body.data.ccv);
    } catch (e) {
        next(e)
    }
    
}

module.exports = { create };
/*
const shippingInfo = {
    'shipping_first_name': 'User',
    'shipping_last_name': 'Test',
    'shipping_address1': '987 State St',
    'shipping_city': 'Los Angeles',
    'shipping_state': 'CA',
    'shipping_zip' : '98765',
}
dp.setShipping(shippingInfo);
*/