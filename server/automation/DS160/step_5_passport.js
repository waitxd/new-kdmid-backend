const mycore = require('../common')

const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'

processStep = async (page, data) => {
    const { passport } = data
    await mycore.Auto_Select(page, 'PassType', passport.type, true)
    await mycore.Auto_Text(page, 'PassNum', passport.number)
    await mycore.Auto_Date(page, 'PassDateIssue', passport.issue_date)
    await mycore.Auto_Date(page, 'PassDateExpire', passport.expiration_date)
    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
}

exports.process = processStep