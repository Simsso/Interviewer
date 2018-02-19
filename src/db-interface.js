module.exports = (() => {
    const login = require('./db/login')

    return {
        validCredentials: login.validCredentials,
        getTokenPayload: login.getTokenPayload
    }
})()