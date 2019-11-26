let kue = require('kue');
let queue = kue.createQueue();
let sleep = require('sleep');
const automation_ds160 = require('../automation/DS-160').default
const axios = require('axios');

queue.process(`ds-160`, async function(job, done) {
    console.log(`Working on job ${job.id}`);
    // console.log(job.data._id, job._id)

    job.data.data._id = job.data._id
    job.data.data.app_id = job.data.app_id
    job.data.data.ipaddr = job.data.ipaddr

    axios.put(process.env.BACKEND_URL + `/ds-160/status/${job.data._id}`, {
        automation_status: {
            result: 'processing',
            error: null
        }
    }, {headers: {"Content-Type": "application/json"}})
    .then()
    .catch(err => console.log(err))

    const result = await automation_ds160(job.data.data);
    console.log('finished', result)
    axios.put(process.env.BACKEND_URL + `/ds-160/status/${job.data._id}`, {
            automation_status: result,
        }, {headers: {"Content-Type": "application/json"}})
        .then()
        .catch(err => console.log(err))
    done();
    
})