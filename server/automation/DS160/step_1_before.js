const confirmlink = require('../confirmlink')

const ID_REGISTER = '#loginForm > div > div > div:nth-child(4) > div > a'

step_1 = async (page, data) => {
    await Promise.all([page.evaluate(`document.querySelector("${ID_REGISTER}").click();`), page.waitForNavigation()])
}

exports.process = step_1;