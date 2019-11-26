const mycore = require('../common')

const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'
processStep = async (page, data) => {
    const { personal } = data
    await mycore.Auto_Select(page, 'CitizenCode', personal.citizenCode, true)
    await mycore.Auto_Text(page, 'SurnameLat', personal.surname)
    await mycore.Auto_Text(page, 'NamesLat', personal.firstnames)
    await mycore.Auto_Select_v2(page, 'OtherSurnamesFlag', personal.b_other_names)
    if(personal.b_other_names == 'yes') {
        for(index in personal.other_names) {
            const name = personal.other_names[index]
            const ID_Prefix = 'Wizard > div > div.wizard__body > div:nth-child(1) > div > div:nth-child(4) > div > ul > li:nth-child('
            const ID_Suffix = ') > div > input'
            const i = parseInt(index) + 1
            await mycore.Auto_Text(page, ID_Prefix + i.toString() + ID_Suffix, name, true)

            if(index < personal.other_names.length - 1)
                await mycore.Auto_Button(page, 'Wizard > div > div.wizard__body > div:nth-child(1) > div > div:nth-child(4) > div > button')
        }
    }
    await mycore.Auto_Select(page, 'Sex', personal.sex)
    await mycore.Auto_Date(page, 'BirthDate', personal.birth_date)
    await mycore.Auto_Text(page, 'BirthPlace', personal.birth_place)

    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
}   

exports.process = processStep