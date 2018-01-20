module.exports = (db, security) => {
    const router = require('express').Router()

    function handler(req, res) {
        res.send(db.getData())
    }

    router.get('/endpoint', security.authMiddleware(), handler)

    return {
        router: router,
        handler: handler
    }
}