const moment = require('moment')

normalize_date = (date) => {
    if(!date) {
        return { DD: null, MMM: null, YYYY: null }
    }
    let terms = date.toUpperCase().split('/')
    let result = {
        DD: terms[0],
        MMM: terms[1],
        YYYY: terms[2]
    }
    return result
}

normalize_date_two = (date) => {
    if(!date) {
        return { DD: null, MMM: null, YYYY: null }
    }
    let terms = moment(date, 'DD/MMM/YYYY')
    
    
    let result = {
        DD: terms.format('DD'),
        MMM: terms.format('MM'),
        YYYY: terms.format('YYYY')
    }
    return result
}

normalize_date_short = (date) => {
    if(!date) {
        return { DD: null, MMM: null, YYYY: null }
    }
    let terms = moment(date, 'DD/MMM/YYYY')
    
    
    let result = {
        DD: terms.format('D'),
        MMM: terms.format('M'),
        YYYY: terms.format('YYYY')
    }
    return result
}

normalize_ssn = (ssn) => {
    let result = {
        ssn1: ssn ? ssn.substring(0, 3) : null,
        ssn2: ssn ? ssn.substring(3, 5) : null,
        ssn3: ssn ? ssn.substring(5) : null
    }
    return result
}

normalize_checkbox = (text) => {
    return text === '' ? true : false
}

normalize = (data) => {
    return data
}
exports.default = normalize