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
    // date formats

    let res = JSON.parse(JSON.stringify(data))
    if( !res )
        return res
    if(res.form_personal_info) {
        res.form_personal_info.date_birth = normalize_date(res.form_personal_info.date_birth)
        res.form_personal_info.social_security_number = normalize_ssn(res.form_personal_info.social_security_number)
    }
    if(res.form_travel) {
        res.form_travel.travel_plan.date_of_arrival = normalize_date_short(res.form_travel.travel_plan.date_of_arrival)
        if(res.form_travel.travel_plan.length_of_stay && res.form_travel.travel_plan.length_of_stay.length) {
            res.form_travel.travel_plan.length_of_stay.length = res.form_travel.travel_plan.length_of_stay.length.toString()
        }
    }

    if(res.form_prev_travel_info) {
        for(let i = 0; i < res.form_prev_travel_info.prev_visit_info.length; i++) {
            res.form_prev_travel_info.prev_visit_info[i].date = normalize_date_short(res.form_prev_travel_info.prev_visit_info[i].date)
        }
        
        res.form_prev_travel_info.US_Visa.date = normalize_date_short(res.form_prev_travel_info.US_Visa.date)
    }

    if(res.form_passport) {
        res.form_passport.issuance_date = normalize_date_two(res.form_passport.issuance_date)
        res.form_passport.expiration_date = normalize_date_two(res.form_passport.expiration_date)
    }

    if(res.form_family) {
        res.form_family.father.birthday = normalize_date(res.form_family.father.birthday)
        res.form_family.mother.birthday = normalize_date(res.form_family.mother.birthday)
        res.form_family.spouse.birthday = normalize_date(res.form_family.spouse.birthday)

        for(let f = 0; f < res.form_family.former_spouse.length; f++) {
            res.form_family.former_spouse[f].birthday = normalize_date(res.form_family.former_spouse[f].birthday)
            res.form_family.former_spouse[f].marriage_date = normalize_date_short(res.form_family.former_spouse[f].marriage_date)
            res.form_family.former_spouse[f].end_date = normalize_date_short(res.form_family.former_spouse[f].end_date)
        }
    }

    if(res.form_work_or_edu) {
        res.form_work_or_edu.start_date = normalize_date_short(res.form_work_or_edu.start_date)
    }

    if(res.form_prev_work_or_edu) {
        res.form_prev_work_or_edu.emp_info.date_from = normalize_date_short(res.form_prev_work_or_edu.emp_info.date_from)
        res.form_prev_work_or_edu.emp_info.date_to = normalize_date_short(res.form_prev_work_or_edu.emp_info.date_to)
        res.form_prev_work_or_edu.edu_info.date_from = normalize_date_short(res.form_prev_work_or_edu.edu_info.date_from)
        res.form_prev_work_or_edu.edu_info.date_to = normalize_date_short(res.form_prev_work_or_edu.edu_info.date_to)
    }

    if(res.form_additional_work) {
        for( let i in res.form_additional_work.militaries )
        {
            res.form_additional_work.militaries[i].date_from = normalize_date_short(res.form_additional_work.militaries[i].date_from)
            res.form_additional_work.militaries[i].date_to = normalize_date_short(res.form_additional_work.militaries[i].date_to)
        }
    }

    if(res.form_SEVIS) {
        if(res.form_SEVIS.program_number)
        {
            let old = res.form_SEVIS.program_number
            res.form_SEVIS.program_number = old.replace(/-/g, '')
        }
    }
    return res
}
exports.default = normalize