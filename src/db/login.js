module.exports = ((db) => {
    const security = require('../security')

    /**
     * Searches for a user based on a given username.
     * 
     * @param {string} username to find the user by.
     * @returns {object} user or null if the user could not be found.
     */
    function getUser(username) {
        let foundUserObject = db.get('users').find({ username: username }).value()
        if (typeof foundUserObject !== 'object') {
            foundUserObject = null // null indicates not found
        }
        return foundUserObject // null or object
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
        return getUser(user)
    }

    return {
        validCredentials: validCredentials,
        getTokenPayload: getTokenPayload
    }
})