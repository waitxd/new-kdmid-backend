const sgMail = require('@sendgrid/mail');
const config = require('../../config/config');
var sizeof = require('object-sizeof')
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
const constants = require('../utils/constants')
const wrapEmail = require('./template').wrapEmail

sgMail.setApiKey(config.API_KEY_SENDGRID);

function base64_encode(file) {
    var data = fs.readFileSync(file);
    return new Buffer.from(data).toString('base64');
}

module.exports = async function (email, data, mail, attachments, toAdmin, ceacNumber = ''){
    const app_id = data.app_id
    const surname = data.form_personal_info.surname
    const given_name = data.form_personal_info.given_name
    const date_birth = data.form_personal_info.date_birth

    return new Promise(function (resolve, reject) {
        try {
            const msg = {
                to: email,
                from: toAdmin ? `no-reply-${app_id}@usa-visas-services.com` : 'no-reply@usa-visas-services.com',
                subject: toAdmin ? `${ceacNumber} - ${surname} ${given_name} - ${date_birth.YYYY} - ${app_id}` : 'Your US Visa Application',
                html: wrapEmail(mail.data.content),
                attachments: attachments,
            };
            console.log('email size:' + (sizeof(msg) / 1024.0 / 1024.0) + 'MB');
            sgMail.send(msg, function (err, json) {
                console.log('end');
                if(err) {
                    console.log(err)
                    reject(err); 
                }
                else resolve();
            });
        } catch (e) {
            console.log(e)
           reject('Sending attachment error' + e);
        }
    });
}
