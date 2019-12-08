const puppeteer = require('puppeteer')
const mycore = require('./common')
const step_0 = require('./DS160/step_0')
const step_1_password = require('./DS160/step_1_password')
const step_2_break = require('./DS160/step_2_break')
const step_4_visit = require('./DS160/step_4_visit')
const step_3_personal = require('./DS160/step_3_personal')
const step_5_passport = require('./DS160/step_5_passport')
const step_6_miscellaneous = require('./DS160/step_6_miscellaneous')
const step_7_relatives = require('./DS160/step_7_relatives')
const step_8_photo = require('./DS160/step_8_photo')
const step_9_review = require('./DS160/step_9_review')

const config = require('../../config/config')

const fs = require('fs');
const aws_s3 = require('../aws/s3')

let kue = require('kue')

let queue = kue.createQueue();
queue.on(`job enqueue`, function() {
  console.log(`Job Submitted in the queue.`)
})

automation_ds160 = async (data) => {
  // Actual Scraping goes Here...
  const chromeLaunchOptions = {
    // ignoreHTTPSErrors: true,
    headless: true,
    timeout: 0,
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  }

  const browser = await puppeteer.launch(chromeLaunchOptions)
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 800 })

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  )

  try {
    await page.goto(`https://evisa.kdmid.ru/`, {waitUntil: 'networkidle2'})
    await step_0.process(page, data)

    await step_1_password.process(page, data)
    await step_2_break.process(page, data)
    await step_3_personal.process(page, data)
    await step_4_visit.process(page, data)
    await step_5_passport.process(page, data)
    await step_6_miscellaneous.process(page, data)
    await step_7_relatives.process(page, data)
    await step_8_photo.process(page, data)
    await step_9_review.process(page, data)
    
    ret = { result: 'success', error: null }
  
  } catch (e) {
    ret = { result: 'fail', error: e }
    console.log('error occured: ', e)
    // await mycore.Auto_Print(page, 'error.pdf')
    // let error_pdf = fs.readFileSync('error.pdf')
    // await aws_s3.uploadPDF(error_pdf, `${data._id}_error.pdf`)
  } finally {
    console.log('browser close')
    
    browser.close()
    return ret
  }
}

addToQueue = (data, ipaddr = null) => {
  let job = queue.create(`ds-160`, { data, ipaddr }).save()
}

exports.default = automation_ds160
exports.addToQueue = addToQueue
