const fs = require('fs');
const sendEmail = require('./sendEmail')
const aws_s3 = require('../aws/s3')
const path = require('path');

module.exports = async (application, mail) => {

    let filePath = {
        confirm: path.relative(process.cwd(), path.join(__dirname + '/PDF/confirm.pdf')),
        customer: path.relative(process.cwd(), path.join(__dirname + '/PDF/customer.pdf')),
        application: path.relative(process.cwd(), path.join(__dirname + '/PDF/application.pdf')),
    }
    await aws_s3.downloadFile(filePath.confirm, 'PDF/' + application._id + '_confirm.pdf')
    await aws_s3.downloadFile(filePath.customer, 'PDF/' + application._id + '_customer.pdf')
    await aws_s3.downloadFile(filePath.application, 'PDF/' + application._id + '_application.pdf')

    let confirm_pdf = fs.readFileSync(filePath.confirm)
    let customer_pdf = fs.readFileSync(filePath.customer)
    let app_pdf = fs.readFileSync(filePath.application)

    application.data.app_id = application.app_id
    application.data.form_personal_info.date_birth = {
        YYYY: application.data.form_personal_info.date_birth ? application.data.form_personal_info.date_birth.split('/')[2] : ""
    }

    const app_id = application.app_id
    const surname = application.data.form_personal_info.surname
    const given_name = application.data.form_personal_info.given_name
    const date_birth = application.data.form_personal_info.date_birth
    const ceacNumber = application.automation_status.ceacNumber

    const unique_subject = `${ceacNumber}_${surname}_${given_name}_${date_birth.YYYY}_${app_id}`

    if(process.env.NODE_ENV != 'development') {
        sendEmail('admin@usa-visas-services.com', application.data, mail, [{
            content: confirm_pdf.toString('base64'),
            filename: `${unique_subject}_Confirm.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
            contentId: 'confirm'
        },{
            content: app_pdf.toString('base64'),
            filename: `${unique_subject}_Application.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
            contentId: 'app'
        },{
            content: customer_pdf.toString('base64'),
            filename: `${unique_subject}_customer.pdf`,
            type: 'application/pdf',
            disposition: 'attachment',
            contentId: 'customer'
        }], true, ceacNumber)
        .then(() => {
            console.log('Success to send email with attachments to admin@usa-visas-services.com')
        })
        .catch(err => {
            console.log('Failed to send email to admin@usa-visas-services.com', err)
        })

        sendEmail('jimdevcare@gmail.com', application.data, mail, [], true, ceacNumber)
        .then(() => {
            console.log('Success to send email without attachments to Developer jimdevcare@gmail.com')
        })
        .catch(err => {
            console.log('Failed to send email to Developer jimdevcare@gmail.com', err)
        })
    }

    sendEmail(application.data.form_addr_and_phone.email, application.data, mail, [{
        content: confirm_pdf.toString('base64'),
        filename: 'confirm.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
        contentId: 'confirm'
    },{
        content: app_pdf.toString('base64'),
        filename: 'application.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
        contentId: 'app'
    }])
    .then(() => {
        console.log(`Success to send email with attachments to customer(${application.data.form_addr_and_phone.email})`)
    })
    .catch(err => {
        console.log(`Failed to send email to customer(${application.data.form_addr_and_phone.email})`, err)
    })
    
}