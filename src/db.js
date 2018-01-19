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

    /**
     * @param {string} user Username.
     */
    function getInterviews(user) {
        return ['test1', 'question2', 'blabla3']
        // TODO: implement
    }

    return {
        validCredentials: validCredentials,
        getTokenPayload: getTokenPayload,
        getInterviews: getInterviews
    }
})();