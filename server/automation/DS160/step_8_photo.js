const mycore = require('../common')
const path = require('path');
const process = require('process')
const aws_s3 = require('../../aws/s3')
const fs = require('fs')

const BTN_SAVE = '#container > button.button.button--success.button--save-photo'
const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'
const BTN_ZOOM_OUT = 'container > button.button.button--primary.button--photo-action.button--zoom-out'
const ZOOM_OUT_COUNT = 20

withPhoto = async (page, url, base64) => {
    const fileInput = await page.$('input[type=file]');
    const filePath = path.relative(process.cwd(), path.join(__dirname + '/images/customer.jpeg'))
    const prefix = 'https://s3.us-east-2.amazonaws.com/assets.new-kdmid/'
    // const result = await aws_s3.downloadFile(filePath, url.substring(prefix.length))

    let base64Data = base64.replace(/^data:image\/jpeg;base64,/,"")
    fs.writeFile(filePath, base64Data, 'base64', function(err) {
        console.log(err)
    })

    await fileInput.uploadFile(filePath);

    // zoom out image start

    for(let i = 0; i < ZOOM_OUT_COUNT; i++)
        await mycore.Auto_Button(page, BTN_ZOOM_OUT)

    // zoom out image finish

    await page.waitForFunction(`document.querySelector("${BTN_SAVE}") && document.querySelector("${BTN_SAVE}").getAttribute("disabled") == null`)
    await page.evaluate(`document.querySelector("${BTN_SAVE}").focus();document.querySelector("${BTN_SAVE}").click();`)

    console.log(filePath)
    await page.waitForFunction(`document.querySelector("#applicantPhotoModal > div > section > div > ul li") || document.querySelector("#applicantPhotoModal").style.display == 'none'`)
    if( await mycore.Auto_Exist_V2(page, 'applicantPhotoModal > div > section > div > ul li')) {
        let errors = await page.evaluate( () => {
            return document.querySelector('#applicantPhotoModal > div > section > div > ul', {visible: true}).innerText
        });
        console.log('failed with uploaded photo. The customer should prepare a photo again.', errors)
        // await withoutPhoto(page, url)
        throw "Failed to upload photo"
        return;
    }
    console.log('Success with this photo')
    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
    return
    
}
processStep = async (page, data) => {
    const { photo } = data
    await mycore.Auto_Button(page, 'btnApplicantPhotoModal', true)
    await withPhoto(page, photo.url, photo.iso)
}
exports.process = processStep