const poll = require('promise-poller').default
const axios = require('axios')

exports.initiateRequest = initiateRequest;
exports.pollForRequestResults = pollForRequestResults;

async function initiateRequest(_id) {
    const response = await axios.put(process.env.BACKEND_URL + `/ds-160/updateConfirmLink/${_id}`, { link: 'init' }, {headers: {"Content-Type": "application/json"}})
    return
}

async function pollForRequestResults(_id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(_id),
        interval,
        retries
    });
}

function requestCaptchaResults(_id) {
    
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            const rawResponse = await axios.get(process.env.BACKEND_URL + `/ds-160/getConfirmLink/${_id}`)
            console.log('------------------------', rawResponse)
            if (!rawResponse || rawResponse.link === 'init') {
                return reject(null)
            }
            resolve(rawResponse.link)
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))