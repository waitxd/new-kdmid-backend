const request = require('request-promise-native');
const poll = require('promise-poller').default;

exports.initiateCaptchaRequest = initiateCaptchaRequest;
exports.pollForRequestResults = pollForRequestResults;

async function initiateCaptchaRequest(apiKey, siteDetails) {
    const formData = {
        method: 'base64',
        // googlekey: siteDetails.sitekey,
        key: apiKey,
        body: siteDetails.img
        // pageurl: siteDetails.pageurl,
        // json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', { form: formData });
    console.log('--------response-------', response, typeof(response))

    let terms = response.split('|')
    if(terms.length > 1)
        return terms[1];
    return null

    return JSON.parse(response).request;
}

async function pollForRequestResults(key, id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(key, id),
        interval,
        retries
    });
}

function requestCaptchaResults(apiKey, requestId) {
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            const rawResponse = await request.get(url);
            console.log('------------------------', rawResponse)
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0){
                if( resp && resp.request && resp.request.includes('UNSOLVABLE'))
                    resolve(null)
                return reject(resp.request);
            }
            resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))