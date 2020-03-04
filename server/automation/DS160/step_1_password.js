const mycore = require('../common')
const recaptcha = require('../recaptcha')
const confirmlink = require('../confirmlink')
const config = require('../../../config/config')
const axios = require('axios')

const ID_STEP_1_CAPTCHA_INPUT = 'CaptchaInputText'
const ID_STEP_1_CAPTCHA_IMAGE = '#CaptchaImage'
const ID_STEP_1_START_BUTTON = '#registerForm > nav > div > button'
const ID_REGISTER = '#loginForm > div > div > div:nth-child(4) > div > a'

step_1 = async (page, data, email) => {
    const { register } = data

    let base64 = null

    await confirmlink.initiateRequest(data._id)

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
    
    await Promise.race([ page.waitForFunction(() => {
        selector => !document.querySelector(selector) || document.querySelector(selector).innerText !== "New user registration",
        {},
        "#contentContainer > section > div.step__heading > div > h4"
    }), page.waitForNavigation() ])

    let text = await page.evaluate( () => {
        const elem = document.querySelector('#contentContainer > section > div.step__heading > div > h4')
        return elem ? elem.innerText : null
    });

    console.log(text)

    if( text )
    {
        await step_1(page, data, email)
        return;
    }
}

exports.process = step_1;