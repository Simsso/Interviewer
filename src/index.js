require('dotenv').config() // load env variables
const express = require('express')
const app = express()

const statusRouter = require('./api/status')
app.use('/api/v1', statusRouter)

const port = process.env.PORT
app.listen(port, () => console.log('Service running on port ' + port))