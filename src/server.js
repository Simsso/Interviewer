require('dotenv').config() // load env variables

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

// logging
app.use(morgan('combined'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// register API endpoints
const db = require('./db')
const security = require('./security')
require('./api/route-util').registerRoutes(app, ['status', 'authenticate', 'users'], db, security)

// start listening
const port = process.env.PORT
app.listen(port, () => console.log('Service running on port ' + port))