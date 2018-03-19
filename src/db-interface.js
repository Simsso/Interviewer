module.exports = (() => {
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('db.json')
    const db = low(adapter)

    db.defaults({ 
        users: [],
        interviews: []
    }).write()

    const login = require('./db/login')(db)
    const signup = require('./db/signup')(db)
    const interviews = require('./db/interviews')(db)

    return {
        validCredentials: login.validCredentials,
        getTokenPayload: login.getTokenPayload,
        addUser: signup.addUser,

        getInterviews: interviews.getAll,
        getInterview: interviews.get,
        addInterview: interviews.add,
        deleteInterview: interviews.drop,
        updateInterview: interviews.update
    }
})()