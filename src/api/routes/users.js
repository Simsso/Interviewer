module.exports = (db, security) => {
    const router = require('express').Router()
    const routeUtil = require('../util/route-util')
    const validate = routeUtil.loadSchemas(['user'])

    function users(req, res) {
        validate['user'](req.body)
        res.json(validate['user'].errors)
    }

    router.post('/users', security.authMiddleware(), users)

    return {
        router: router,
        users: users
    }
}