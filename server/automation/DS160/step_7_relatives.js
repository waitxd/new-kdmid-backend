const mycore = require('../common')

const BTN_NEXT = '#Wizard > div > div.wizard__body > div.step__action-area > nav > div > button.pagination__button.pagination__button--next.button'

processStep = async (page, data) => {
    const { relatives } = data
    await mycore.Auto_Select_v2(page, 'RelativesFlag', relatives.b_relatives, true)

    if(relatives.b_relatives == 'yes') {
        
        for(index in relatives.relatives) {
            const person = relatives.relatives[index]
            const i = parseInt(index) + 1
            console.log(i)
            await mycore.Auto_Select(page, `Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > ul > li:nth-child(${i}) > div:nth-child(1) select`, person.degree, true)
            await mycore.Auto_Text(page,   `Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > ul > li:nth-child(${i}) > div:nth-child(2) input`, person.surname)
            await mycore.Auto_Text(page,   `Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > ul > li:nth-child(${i}) > div:nth-child(3) input`, person.firstname)
            await mycore.Auto_Date(page,   `Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > ul > li:nth-child(${i}) > div:nth-child(4) input`, person.birth_date)
            await mycore.Auto_Text(page,   `Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > ul > li:nth-child(${i}) > div:nth-child(5) input`, person.address)
            
            if(index < relatives.relatives.length - 1)
                await mycore.Auto_Button(page, 'Wizard > div > div.wizard__body > div:nth-child(5) > div > div > div > button')
        }
    }

    await page.evaluate(`document.querySelector("${BTN_NEXT}").focus();document.querySelector("${BTN_NEXT}").click();`)
}

exports.process = processStep