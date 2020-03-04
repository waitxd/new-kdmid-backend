const mycore = require('../common')
const recaptcha = require('../recaptcha')
const config = require('../../../config/config')

const ID_STEP_1_CAPTCHA_INPUT = 'CaptchaInputText'
const ID_STEP_1_CAPTCHA_IMAGE = '#CaptchaImage'
const ID_STEP_1_START_BUTTON = '#registerForm > nav > div > button'
const ID_REGISTER = '#loginForm > div > div > div:nth-child(4) > div > a'

step_1 = async (page, data) => {
    const { register } = data

    let base64 = null

    let number = parseInt(data.email_unique_number || 0) + 1

    let email = `traveler-${data.app_id}-${number}@travel-group.org`
    console.log(email, register.password)

    await axios.put(process.env.BACKEND_URL + `/ds-160/updateEmailUniqueNumber/${data._id}`, { number }, {headers: {"Content-Type": "application/json"}})

    await Promise.all([page.evaluate(`document.querySelector("${ID_REGISTER}").click();`), page.waitForNavigation()])

    await mycore.Auto_Text(page, 'Email', email, true)
    await mycore.Auto_Text(page, 'EmailConfirmation', email)

    await mycore.Auto_Text(page, 'Password', register.password)
    await mycore.Auto_Text(page, 'ConfirmPassword', register.confirmPassword)
    
    await page.waitForSelector(ID_STEP_1_CAPTCHA_IMAGE)

    base64 = await page.evaluate((ID_STEP_1_CAPTCHA_IMAGE) => {
        const getBase64Image = (img) => {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            if(img.width == 0 || img.height == 0)
                return null;
            // console.log(canvas, img.width, img.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        }
        let captcha_img = document.querySelector(ID_STEP_1_CAPTCHA_IMAGE)
        console.log('ID_STEP_1_CAPTCHA_IMAGE passed')
        let base64 = getBase64Image(captcha_img)
        console.log('getBase64Image passed')
        return base64
    }, ID_STEP_1_CAPTCHA_IMAGE);

    const apiKey = config.API_KEY_2CAPTCHA
    const siteDetails = { img: base64 }

    const requestId = await recaptcha.initiateCaptchaRequest(apiKey, siteDetails)
    if( requestId == null )
    {
        await step_1(page, data)
        return;
    }
    const response = await recaptcha.pollForRequestResults(apiKey, requestId)
    if( response == null )
    {
        await step_1(page, data)
        return;
    }
    await page.evaluate(`document.getElementById("${ID_STEP_1_CAPTCHA_INPUT}").value = '';`);
    
    await page.type('#' + ID_STEP_1_CAPTCHA_INPUT, response);

    await page.evaluate(`document.getElementById('registerForm').submit()`);

    //await Promise.all([page.evaluate(`document.getElementById("${ID_STEP_1_START_BUTTON}").click();`), page.waitForNavigation()])
    
    await Promise.race([ page.waitForSelector('#registerForm > div:nth-child(4) > div > div:nth-child(2) > div > span'), page.waitForNavigation() ])

    let error = await page.evaluate( () => {
        return document.querySelector('#registerForm > div:nth-child(4) > div > div:nth-child(2) > div > span')
    });

    console.log(error)

    if( error )
    {
        await step_1(page, data)
        return;
    }
}

exports.process = step_1;