const router = require('express').Router()

router.get('/status', (req, res) => {
    res.json({ status: 'online' })
})

module.exports = router