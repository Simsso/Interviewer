module.exports = () => {
    const router = require('express').Router()

    function status(req, res) {
        res.json({ message: 'Running' })
    }

    router.get('/status', status)

    return {
        router: router,
        status: status
    }
}