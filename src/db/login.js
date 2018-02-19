module.exports = (() => {
    /**
     * @param {string} user Username.
     * @param {string} password Password.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validCredentials(user, password) {
        return user && password
        // TODO: implement authentication
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
        getTokenPayload: getTokenPayload
    }
})()