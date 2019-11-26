const mycore = require('../common')

const BTN_Continue = 'createNewApp'

processStep = async (page, data) => {
    await Promise.all([page.evaluate(`document.getElementById("${BTN_Continue}").focus();document.getElementById("${BTN_Continue}").click();`), page.waitForNavigation()])
    
}

exports.process = processStep