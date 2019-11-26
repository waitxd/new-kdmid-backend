const mycore = require('../common')

const ID_STEP_3_SELECT_Nationality = 'ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_NATL'

waitForProcess = async (page) => {
    await page.waitForSelector('#' + ID_STEP_3_SELECT_Nationality)
}

processStep = async (page, data) => {
    /*
    await mycore.Auto_Text(page, ID_STEP_2_TEXT_GIVEN_NAME, data.firstname)
    await mycore.Auto_Checkbox(page, ID_STEP_2_CHECK_FULL_NAME_NA, true)
    await mycore.Auto_Radio(page, ID_STEP_2_RADIO_OtherNames, data.b_ever_used_other_names)
    await page.waitForSelector('#' + ID_STEP_2_TEXT_Telecode_Surname)
    await mycore.Auto_Select(page, ID_STEP_2_SELECT_DATE_DD, data.date_birth.DD)
    await Promise.all([page.evaluate(`document.getElementById("${ID_STEP_2_BUTTON_NEXT}").focus();document.getElementById("${ID_STEP_2_BUTTON_NEXT}").click();`), page.waitForNavigation()])
    */
}

exports.waitForProcess = waitForProcess
exports.process = processStep