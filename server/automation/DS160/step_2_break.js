const axios = require('axios')
const confirmlink = require('../confirmlink')

const BTN_Continue = 'createNewApp'
const AppIdSelector = '#contentContainer > section > div.step__body > div > div > div > div > div > p.form-group__field-value.form-group__field-value--important'

processStep = async (page, data) => {

    const link = await confirmlink.pollForRequestResults(data._id)
    if( link == null )
    {
        console.log('Not received the confirm email')
        throw new Error('Not received confirm email')
    }

    console.log('Confirm Link: ', link)

    await page.goto(link, {waitUntil: 'networkidle2'})

    await page.waitForSelector('#loginLink')

    await Promise.all([page.evaluate(`document.getElementById("loginLink").focus();document.getElementById("loginLink").click();`), page.waitForNavigation()])

    await page.waitForSelector('#Email')

    let number = parseInt(data.email_unique_number || 0) + 1
    let email = `traveler-${data.app_id}-${number}@travel-group.org`

    await mycore.Auto_Text(page, 'Email', email, true)
    await mycore.Auto_Text(page, 'Password', data.register.password)

    await Promise.all([await page.evaluate(`document.getElementById('loginForm').submit()`), page.waitForNavigation()])

    await page.waitForSelector(AppIdSelector)

    console.log('found AppIdSelector')

    const id = await page.evaluate((AppIdSelector) => { 
        return document.querySelector(AppIdSelector).innerText;
    }, AppIdSelector);

    console.log('kdmid_id: ', id)

    await axios.put(process.env.BACKEND_URL + `/ds-160/updateKdmidId/${data._id}`, { id }, {headers: {"Content-Type": "application/json"}})

    await Promise.all([page.evaluate(`document.getElementById("${BTN_Continue}").focus();document.getElementById("${BTN_Continue}").click();`), page.waitForNavigation()])
    
}

exports.process = processStep