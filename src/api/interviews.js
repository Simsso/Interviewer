const router = require('express').Router()
const security = require('../security')

router.get('/interviews', security.authMiddleware(), (req, res) => {
    res.send(req.user)
})

module.exports = router