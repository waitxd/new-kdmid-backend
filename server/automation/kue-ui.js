let kue = require('kue')
let queue = kue.createQueue()
let express = require('express')
let ui = require('kue-ui')
let app = express()
const config = require('../../config/config')

if( config.env == 'development' ) {
    ui.setup({
        apiURL: '/kue-api',
        baseURL: '/kue',
        updateInterval: 5000
    })
} else if( config.env == 'production' ) {
    ui.setup({
        apiURL: '/admin/kue-api',
        baseURL: '/admin/kue',
        updateInterval: 5000
    })
}

app.use('/kue-api', kue.app)

app.use('/kue', ui.app)

app.listen(5000)

console.log('Listening on port 5000')