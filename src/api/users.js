const router = require('express').Router()
const routeUtil = require('./route-util')
const validate = routeUtil.loadSchemas(['user'])

router.post('/users', (req, res) => {
    validate['user'](req.body)
    res.json(validate['user'].errors)
})

module.exports = router