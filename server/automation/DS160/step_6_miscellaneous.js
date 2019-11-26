const mycore = require('../common')

const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'
processStep = async (page, data) => {
    const { contacts_occupations: miscellaneous } = data
    await mycore.Auto_Select_v2(page, 'HomeAddressFlag', miscellaneous.b_resident, true)

    if(miscellaneous.b_resident == 'yes') {
        const { resident } = miscellaneous
        await mycore.Auto_Text(page, 'HomeAddress', resident.address, true)
        await mycore.Auto_Text(page, 'HomePhone', resident.phone)
        await mycore.Auto_Text(page, 'HomeFax', resident.fax)
    }

    await mycore.Auto_Select_v2(page, 'OccupationFlag', miscellaneous.b_occupation, true)

    if(miscellaneous.b_occupation == 'yes') {
        const { occupation } = miscellaneous
        await mycore.Auto_Text(page, 'OccupationOrgName', occupation.name, true)
        await mycore.Auto_Text(page, 'OccupationPosition', occupation.position)
        await mycore.Auto_Text(page, 'OccupationAddress', occupation.address)
        await mycore.Auto_Text(page, 'OccupationPhone', occupation.phone)
        await mycore.Auto_Text(page, 'OccupationFax', occupation.fax)
        await mycore.Auto_Text(page, 'OccupationEmail', occupation.email)
    }

    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
    
}

exports.process = processStep