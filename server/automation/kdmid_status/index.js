const mycore = require('../common')
const puppeteer = require('puppeteer')
const fs = require('fs')
const aws_s3 = require('../../aws/s3')

processStep = async (page, data) => {

    // Actual Scraping goes Here...
    const chromeLaunchOptions = {
        // ignoreHTTPSErrors: true,
        headless: true,
        // timeout: 0,
        args: ['--disable-setuid-sandbox', '--no-sandbox'],
    }

    const browser = await puppeteer.launch(chromeLaunchOptions)
    page = await browser.newPage()

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    )

    await page.goto(`https://evisa.kdmid.ru/en-US/Home/StatusCheck`)

    await page.waitForSelector("#txtAppId")

    await mycore.Auto_Text(page, 'txtAppId', data.kdmid_id, true)
    await mycore.Auto_Text(page, 'pwdPassword', data.data.register.password, true)

    await mycore.Auto_Button(page, 'formStatus > div > div.site-section__body > div > div > div > div:nth-child(4) > button', true)

    await page.waitForSelector('#pnlStatus')

    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './'});
    await mycore.Auto_Button(page, 'pnlStatus > div.panel-body > div > button:nth-child(1)', true)

    await waitForFileToDownload(page, './')

    let notice_pdf = fs.readFileSync('./Notice.pdf')
    await aws_s3.uploadPDF(notice_pdf, `${data._id}_notice.pdf`)

    browser.close();
}
async function waitForFileToDownload(page, downloadPath) {
    await page.waitFor(5000)
}
// processStep(null, { 
//     _id: '5decf4b4a58db726ff2b8d49',
//     kdmid_id: '48161-16567-40665',
//     data: {
//         register: {
//             password: 'abcdef1'
//         }
//     } 
// })
exports.process = processStep