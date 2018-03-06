module.exports = ((db) => {
    const security = require('../security')

    function getUser(username) {
        return db.get('users').find({ username: username }).value()
    }

    /**
     * @param {string} username Username.
     * @param {string} password Password.
     * @returns {boolean} True if valid, false otherwise.
     */
    async function validCredentials(username, password) {
        const user = getUser(username)
        if (user === null) {
            return false
        }
        return await security.validatePassword(user.password.hash, user.password.salt, user.password.iterations, password)
    }
    
    /**
     * @param {string} user Username.
     * @returns {object} Token payload
     */
    function getTokenPayload(user) {
        return { user: user }
        // TODO: read relevant information from db
    }

    return {
        validCredentials: validCredentials,
        getTokenPayload: getTokenPayload,
        getUser: getUser
    }
})