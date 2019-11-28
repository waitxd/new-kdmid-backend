const addToQueue = require('../automation/DS-160').addToQueue
const normalize_ds160 = require('../format/DS-160').default
const axios = require('axios');

function simulate(req, res, next) {

  const { applicationId } = req.query

  if(applicationId) {

    let headers = {
      "Content-Type": "application/json"
    };

    axios({ url: `https://kdmid-evisa.com/v1/api/ds-160/${applicationId}`, method: "get", headers })
      .then(result => {
        console.log('success to clone from server', result.data._id)

        let normalizedData = normalize_ds160(result.data.data)
        addToQueue(normalizedData, result.data._id, result.data.app_id, null)

        return res.json(result.data)
      })
      .catch(err => {
        console.log('failed to clone from server ', err)
        return res.json('failed to clone from server ', err)
      })
  } else {
    return res.json('no applicationId')
  }
}
module.exports = { simulate };
