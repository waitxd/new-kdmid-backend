const mycore = require('./common')
const puppeteer = require('puppeteer')
const imagesToPdf = require("images-to-pdf")
const CLASS_FOR_BOTTOM = 'visa-form-bottom-btn-group'

hideBottomOf = async (page) => {
    await page.evaluate((sel) => {
        var element = document.querySelector("." + sel);
        element.setAttribute("style", "display: none;")
    }, CLASS_FOR_BOTTOM)
}

gotoPrev = async (page) => {
    await page.evaluate((sel) => {
        var btn_prev = document.querySelector("." + sel + " > button:nth-child(1)");
        btn_prev.click()
    }, CLASS_FOR_BOTTOM)
}

existPrev = async (page) => {
    const result = await page.evaluate((sel) => {
        var btn_prev = document.querySelector("." + sel + " > button:nth-child(1)");
        return btn_prev.innerText
    }, CLASS_FOR_BOTTOM)
    return result == 'Prev'
}

waitForImagesOf = async (page) => {
    await page.evaluate(async () => {
        const selectors = Array.from(document.querySelectorAll("img"));
        await Promise.all(selectors.map(img => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        }));
    })
}

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

    await page.goto(process.env.FRONTEND_URL + `/ds-160/application-form/token=${data._id}`)

    await page.waitForSelector("." + CLASS_FOR_BOTTOM)

    let n = 0
    let images = []
    while(await existPrev(page)) {
        await gotoPrev(page)
        await waitForImagesOf(page)
        await hideBottomOf(page)
        await mycore.Auto_Screenshot(page, `screens/${n}.png`)
        images.unshift(`screens/${n}.png`)
        n++
    }

    await imagesToPdf(images, "screens/customer.pdf")
    browser.close();
}
processStep(null, { _id: '5d8192a2c445ff129c61043f'})
//exports.process = processStep