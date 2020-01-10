const mycore = require('../common')
const recaptcha = require('../recaptcha')
const config = require('../../../config/config')

const ID_CitizenCode = 'CitizenCode'
const ID_VisitArea = 'VisitArea'
const ID_AgreeWithConditions = 'cbAgreedWithConditions'
const ID_AgreedWithProcessing = 'cbAgreedWithProcessing'
const ID_AgreedWithEmailNotifications = 'cbAgreedWithEmailNotifications'
const BTN_Start = 'btnStartNewApp'

start = async (page, data) => {
    const { start } = data

    await mycore.Auto_Select(page, ID_CitizenCode, start.citizenCode, true)
    await mycore.Auto_Select(page, ID_VisitArea, start.visitArea, true)

    await mycore.Auto_PureRadio(page, ID_AgreeWithConditions, start.b_conditions, true)
    await mycore.Auto_PureRadio(page, ID_AgreedWithProcessing, start.b_processing, true)
    await mycore.Auto_PureRadio(page, ID_AgreedWithEmailNotifications, start.b_email_notification, true)

    // if(start.b_conditions && start.b_processing && start.b_email_notification) {
        await Promise.all([page.evaluate(`document.getElementById("${BTN_Start}").focus();document.getElementById("${BTN_Start}").click();`), page.waitForNavigation()])
    // }
}

exports.process = start;