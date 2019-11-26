
const automation_ds160 = require('../automation/DS-160').default
const data = {

    start: {
        language: 'en-US',
        b_confirm: true,

        citizenCode: '20',
        visitArea: '7',
        b_conditions: true,
        b_processing: true,
        b_email_notification: true
    },
    register: {
        email: 'a@a.com',
        emailConfirmation: 'a@a.com',
        password: '123456a',
        confirmPassword: '123456a'
    },
    personal: {
        citizenCode: '20',
        surname: 'Surname',
        firstnames: 'Firstnames',
        b_other_names: 'yes',
        other_names: ["other1", "other2"],
        sex: 'M',
        birth_date: '12.03.1998',
        birth_place: 'City, State, Country',
    },
    visit: {
        visakind: '3:41:5',
        visitArea: '7',
        entry_date: '05.12.2019',
        stays: [{
            code: '0',
            name: 'asdf',
            address: 'a',
            phone: '+1234-234',
            fax: '1234',
            email: 'a@a.com'
        }],
        b_visited_russia: 'yes',
        visite_russia_info: {
            amount: '3',
            date_from: '05.09.2006',
            date_to: '22.08.2007',
        }
    },
    
    passport: {
        type: '2',
        number: 'M1234567',
        issue_date: '10.06.2014',
        expiration_date: '09.03.2021'
    },
    contacts_occupations: {
        b_resident: 'yes',
        resident: {
            address: 'address 1234',
            phone: '04729834',
            fax: '21341',
        },
        b_occupation: 'yes',
        occupation: {
            name: 'Occu',
            position: 'Accountant',
            address: 'Vlassss',
            phone: '23592034',
            fax: '235234',
            email: 'b@b.com'
        },
    },
    relatives: {
        b_relatives: 'yes',
        relatives: [{
            degree: '2',
            surname: 'Ukl',
            firstname: 'woeig',
            birth_date: '02.02.2004',
            address: 'egoweigj'
        }, {
            degree: '3',
            surname: 'ab',
            firstname: '1234',
            birth_date: '02.02.2004',
            address: 'gwefwefewf'
        }]
    },
    photo: {
        url: "https://s3.us-east-2.amazonaws.com/assets.new-kdmid/images/1573937774560-lg.jpg"
    }
}

automation_ds160(data);