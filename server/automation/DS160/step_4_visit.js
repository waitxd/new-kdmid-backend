const mycore = require('../common')

const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'

processStep = async (page, data) => {
    const {visit} = data
    await mycore.Auto_Select(page, 'VisaKind', visit.visakind, true)

    await mycore.Auto_Select(page, 'VisitArea', visit.visitArea, true)
    await mycore.Auto_Date(page, 'EntryDate', visit.entry_date)

    for(index in visit.stays) {
        const stay = visit.stays[index]
        await mycore.Auto_Select(page, 'StayCode' + index, stay.code, true)
        await mycore.Auto_Text(page, 'StayName' + index, stay.name)
        await mycore.Auto_Text(page, 'StayAddress' + index, stay.address)
        await mycore.Auto_Text(page, 'StayPhone' + index, stay.phone)
        await mycore.Auto_Text(page, 'StayFax' + index, stay.fax)
        await mycore.Auto_Text(page, 'StayEmail' + index, stay.email)

        if(index < visit.stays.length - 1)
            await mycore.Auto_Button(page, 'AddStayPlaceButton')
    }
    await mycore.Auto_Select_v2(page, 'TripsFlag', visit.b_visited_russia)
    if(visit.b_visited_russia == 'yes') {
        await mycore.Auto_Text(page, 'TripsAmount', visit.visite_russia_info.amount, true);
        await mycore.Auto_Date(page, 'TripsDateLastFrom', visit.visite_russia_info.date_from);
        await mycore.Auto_Date(page, 'TripsDateLastTo', visit.visite_russia_info.date_to);
    }
    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
}

exports.process = processStep