module.exports = () => {
    const router = require('express').Router()

    function status(req, res) {
        res.status(200).json({ message: 'Online' })
    }

    router.get('/status', status)

    return {
        router: router,
        status: status
    }
}