/**
 * API endpoint boilerplate.
 */

module.exports = (db, security) => {
    const router = require('express').Router()
    const messageKeys = require('../util/message-keys')

    async function handler(req, res) {
        try {
            res.send(await db.getData())
        }
        catch(e) {
            res.status(500).json({ message: 'A database error occurred.', key: messageKeys.DB_ERROR })
        }
    }

    router.get('/endpoint', security.authMiddleware(), handler)

    return {
        router: router,
        handler: handler
    }
}