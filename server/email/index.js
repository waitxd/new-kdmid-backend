const sgMail = require('@sendgrid/mail');
const config = require('../../config/config');
var sizeof = require('object-sizeof')

const engine = (to, from, subject, html, attachments = [], cc = undefined) => {
    return new Promise(function (resolve, reject) {
        try {
            const msg = {
                to: to,
                cc: cc,
                from: from,
                subject: subject,
                html: html,
                attachments: attachments.map(att => { 
                    const { content, ...rest } = att
                    console.log(rest)
                    return {
                        content: Buffer.from(att.content.data).toString('base64'),
                        filename: att.filename,
                        type: att.contentType,
                        disposition: att.contentDisposition,
                        contentId: att.contentId ? att.contentId : `<${att.filename}>`,
                    }
                }),
            };
            console.log('email size:' + (sizeof(msg) / 1024.0 / 1024.0) + 'MB');
            sgMail.send(msg, function (err, json) {
                if(err) {
                    console.log(JSON.stringify(err.response.body.errors))
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