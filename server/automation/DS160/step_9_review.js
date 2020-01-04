const mycore = require('../common')

const AppIdSelectr = '#PetitionForm > section > div.step__heading > div > h4'

processStep = async (page, data) => {
    
    await mycore.Auto_PureRadio(page, 'cbAgreedWithProcessing', true, true)
    await mycore.Auto_PureRadio(page, 'cbAgreedWithAuthencity', true)
    await mycore.Auto_PureRadio(page, 'cbAgreedWithConditions', true)
    await mycore.Auto_PureRadio(page, 'cbAgreedWithEntryRejections', true)

    if (await mycore.Auto_Exist_V2(page, 'cbHaveReadInfo'))
        await mycore.Auto_PureRadio(page, 'cbHaveReadInfo', true)

    await page.waitForFunction(`document.querySelector("#btnSave") && document.querySelector("#btnSave").getAttribute("disabled") == null`)
    await page.evaluate(`document.querySelector("#btnSave").focus();document.querySelector("#btnSave").click();`)
}
exports.process = processStep