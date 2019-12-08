const mycore = require('../common')
const axios = require('axios');

const BTN_Continue = 'createNewApp'
const AppIdSelector = '#contentContainer > section > div.step__body > div > div > div > div > div > p.form-group__field-value.form-group__field-value--important'

processStep = async (page, data) => {

    await page.waitForSelector(AppIdSelector)

    const id = await page.evaluate((AppIdSelector) => { 
        return document.querySelector(AppIdSelector).innerText;
    }, AppIdSelector);

    console.log('kdmid_id: ', id)

    await axios.put(process.env.BACKEND_URL + `/ds-160/updateKdmidId/${data._id}`, { id }, {headers: {"Content-Type": "application/json"}})

    await Promise.all([page.evaluate(`document.getElementById("${BTN_Continue}").focus();document.getElementById("${BTN_Continue}").click();`), page.waitForNavigation()])
    
}

exports.process = processStep