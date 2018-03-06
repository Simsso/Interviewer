module.exports = ((session) => {
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync(getPath())
    const db = low(adapter)

    async function reset() {
        db.set('users', []).write()
    }

    function getPath() {
        return 'data/' + session + '.json'
    }

    db.defaults({ 
        users: []
    }).write()

    const login = require('./db/login')(db)
    const signup = require('./db/signup')(db)

    return {
        reset: reset,
        validCredentials: login.validCredentials,
        getTokenPayload: login.getTokenPayload,
        addUser: signup.addUser,
        getUser: login.getUser
    }
})