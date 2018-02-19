module.exports = (() => {
    const login = require('./db/login')
    const signup = require('./db/signup')

    return {
        validCredentials: login.validCredentials,
        getTokenPayload: login.getTokenPayload,
        addUser: signup.addUser
    }
})()