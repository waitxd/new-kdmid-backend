let kue = require('kue');
let queue = kue.createQueue();
let sleep = require('sleep');
const automation_ds160 = require('../automation/DS-160').default
const axios = require('axios');

queue.process(`ds-160`, async function(job, done) {
    console.log(`Working on job ${job.id}`);

    console.log(`Agency: ${job.data.data.agency}, job.ip: ${job.data.ipaddr}, Customer's ip: ${job.data.data.ipaddr}`)

    axios.put(process.env.BACKEND_URL + `/ds-160/status/${job.data.data._id}`, {
        automation_status: {
            result: 'processing',
            error: null
        }
    }, {headers: {"Content-Type": "application/json"}})
    .then()
    .catch(err => {
        console.log('Error occured')
    })

    const result = await automation_ds160(job.data.data);
    console.log('finished', result.result)
    axios.put(process.env.BACKEND_URL + `/ds-160/status/${job.data.data._id}`, {
            automation_status: result,
        }, {headers: {"Content-Type": "application/json"}})
        .then()
        .catch(err => console.log(err))
    done();
    
})