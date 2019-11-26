
Auto_Exist = async (page, id) => {
    const exist = await page.$('#' + id, {visible: true})
    return exist !== null
}

Auto_Exist_V2 = async (page, id) => {
    let exist = await page.evaluate( (id) => {
        return document.querySelector('#' + id, {visible: true})
    }, id);
    return exist != null
}

Auto_Explain = async (page, prefix, suffix, radio, text, wait = false) => {

    const ID_RADIO = prefix + '_rbl' + suffix
    const ID_EXPL = prefix + '_tbx' + suffix

    if(wait) {
        await page.waitForSelector('#' + ID_RADIO, {visible: true})
    }

    await Auto_Radio(page, ID_RADIO, radio)
    if(radio) {
        await page.waitForSelector('#' + ID_EXPL)
        await Auto_Text(page, ID_EXPL, text)
    }
}

Auto_Button = async (page, selector, wait = false) => {
    if(true) {
        await page.waitForSelector('#' + selector, {visible: true})
    }
    await page.evaluate(`document.querySelector("#${selector}").focus();document.querySelector("#${selector}").click();`)
}

Auto_Text = async (page, id, text, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }
    page.evaluate((id, text) => { (document.querySelector('#' + id)).readOnly = false; (document.querySelector('#' + id)).value = ''; }, id, text);
    if(text && text.length)
        // await page.evaluate((id, text) => { (document.getElementById(id)).value = text; }, id, text);
        await page.type('#' + id, text);
}

Auto_PureRadio = async (page, id, value, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }

    await page.evaluate(`if( document.querySelector("#${id}") ) document.querySelector("#${id}").click();`)
}

Auto_Radio = async (page, id, value, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }
    if (value) {
        await page.evaluate(`if( document.getElementById("${id + '_0'}") ) document.getElementById("${id + '_0'}").click();`)
    } else {
        await page.evaluate(`if( document.getElementById("${id + '_1'}") ) document.getElementById("${id + '_1'}").click();`)
    }
    await page.waitFor(500)
}

Auto_Checkbox = async (page, id, text, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }
    if( !text || ( typeof(text) == 'string' && text.length == 0) )
        await page.evaluate(`document.getElementById("${id}").checked = true;`)

    await page.waitFor(500)
}

Auto_Select = async (page, id, value, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }
    await page.waitForFunction(`document.querySelector("#${id}") && document.querySelector("#${id}").getAttribute("disabled") == null`)
    // await page.evaluate((id, value) => {
    //     if(document.getElementById('#' + id))
    //         document.getElementById('#' + id).value = value
    // }, id, value)
    await page.select('#' + id, value)
    // await page.waitFor(500)
}

Auto_Select_v2 = async (page, id, value, wait = false) => {
    if(wait) {
        await page.waitForSelector('#' + id, {visible: true})
    }
    await page.waitForFunction(`document.getElementById("${id}") && document.getElementById("${id}").getAttribute("disabled") == null`)
    await page.$eval('#' + id, (element, value) => {
        for (const option of Array.from(element.options)) {
          if (option.textContent.includes(value)) {
            option.selected = true;
            element.dispatchEvent(new Event('input', { 'bubbles': true }));
            element.dispatchEvent(new Event('change', { 'bubbles': true }));
            return true;
          }
        }
        return false;
    }, value);
}

Auto_Date = async (page, ID, date, wait = false) => {

    // let terms = date.split('/')

    await Auto_Text(page, ID, date, wait)
    // await Auto_Select(page, ID + '_Month', terms[1], wait)
    // await Auto_Text(page, ID + '_Year', terms[2], wait)
}

Auto_Array = async (page, control, prefix, suffix, index, value = '', wait = false) => {
    const ID = prefix + suffix + (parseInt(index) + 1).toString()

    if( control == 'text' ) {
        await Auto_Text(page, ID + '_TextBox', value, wait)
    } else if( control == 'select' ) {
        await Auto_Select(page, ID + '_List', value, wait)
    } else if( control == 'button' ) {
        await Auto_Button(page, ID, wait)
    } else if( control == 'date' ) {
        await Auto_Date(page, ID, value, wait)
    } else if ( control == 'wait' ) {
        await page.waitForSelector('#' + ID)
    } else if ( control == 'checkbox' ) {
        await this.Auto_Checkbox(page, ID, value, wait)
    }
}

Auto_Print = async (page, target) => {
    await page.emulateMedia('screen');
    await page.pdf({path: target});
}

Auto_Screenshot = async (page, target) => {
    await page.screenshot({path: target, fullPage: true});
}

exports.Auto_Exist = Auto_Exist
exports.Auto_Exist_V2 = Auto_Exist_V2
exports.Auto_Text = Auto_Text
exports.Auto_Radio = Auto_Radio
exports.Auto_Checkbox = Auto_Checkbox
exports.Auto_Select = Auto_Select
exports.Auto_Select_v2 = Auto_Select_v2
exports.Auto_Button = Auto_Button
exports.Auto_Date = Auto_Date
exports.Auto_Array = Auto_Array
exports.Auto_Explain = Auto_Explain
exports.Auto_Print = Auto_Print
exports.Auto_Screenshot = Auto_Screenshot
exports.Auto_PureRadio = Auto_PureRadio