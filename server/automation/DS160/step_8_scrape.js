const mycore = require('../common')

const ID_SELECT_DEST = 'ctl00_phBody_StepViewMDestinationStep_Destinations_Destination1_List'
const BTN_NEXT = 'ctl00_phBody_btnForward'

processStep = async (page, data) => {
    const { appointment } = data
    await mycore.Auto_Select(page, ID_SELECT_DEST, appointment.destination, true)
    
    let innerHTML = await page.evaluate( (id) => {
        return document.querySelector('#' + id).innerHTML
    }, ID_SELECT_DEST);
    console.log(data.start.country + ': [' + innerHTML + '],')
    // await page.evaluate(`document.getElementById("${BTN_NEXT}").focus();document.getElementById("${BTN_NEXT}").click();`)
    /*
    await mycore.Auto_Text(page, ID_STEP_2_TEXT_GIVEN_NAME, data.firstname)
    await mycore.Auto_Checkbox(page, ID_STEP_2_CHECK_FULL_NAME_NA, true)
    await mycore.Auto_Radio(page, ID_STEP_2_RADIO_OtherNames, data.b_ever_used_other_names)
    await page.waitForSelector('#' + ID_STEP_2_TEXT_Telecode_Surname)
    await mycore.Auto_Select(page, ID_STEP_2_SELECT_DATE_DD, data.date_birth.DD)
    await Promise.all([page.evaluate(`document.getElementById("${ID_STEP_2_BUTTON_NEXT}").focus();document.getElementById("${ID_STEP_2_BUTTON_NEXT}").click();`), page.waitForNavigation()])
    */
}
exports.process = processStep