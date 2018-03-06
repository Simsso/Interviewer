module.exports = (db, security) => {
    const router = require('express').Router()
    const validate = security.validate()
    const messageKeys = require('../util/message-keys')

    async function addUser(req, res) {
        const user = req.body
        const valid = validate['user'](user)
        if (!valid) {
            const errors = validate['user'].errors
            return res.status(400).json({ 
                message: 'Invalid user object passed',
                key: messageKeys.SCHEMA_VALIDATION_ERROR,
                errors: errors
            })
        }
        try {
            const createdUser = await db.addUser(user)
            return res.status(201).json(createdUser)
        }
        catch(e) {
            return res.status(500).json({ 
                message: 'User could not be added to the database because of a datbase error',
                key: messageKeys.DB_ERROR
            })
        }
    }

    router.post('/users', addUser)

    return {
        router: router,
        addUser: addUser
    }
}