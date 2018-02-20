module.exports = (() => {
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('data/db.json')
    const db = low(adapter)

    db.defaults({ 
        users: []
    }).write()

    const login = require('./db/login')(db)
    const signup = require('./db/signup')(db)

    return {
        validCredentials: login.validCredentials,
        getTokenPayload: login.getTokenPayload,
        addUser: signup.addUser
    }
})()