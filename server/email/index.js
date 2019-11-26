const sgMail = require('@sendgrid/mail');
const config = require('../../config/config');
var sizeof = require('object-sizeof')

const engine = (to, from, subject, html, attachments) => {
    return new Promise(function (resolve, reject) {
        try {
            const msg = {
                to: to,
                from: from,
                subject: subject,
                html: html,
                attachments: attachments ? attachments : [],
            };
            console.log('email size:' + (sizeof(msg) / 1024.0 / 1024.0) + 'MB');
            sgMail.send(msg, function (err, json) {
                if(err) {
                    console.log(err)
                    reject(err); 
                }
                else resolve();
            });
        } catch (e) {
            console.log(e)
            reject('Email engine error: ' + e);
        }
    });
}

module.exports = {
    engine
}