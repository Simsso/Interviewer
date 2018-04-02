module.exports = ((db) => {
    const security = require('../security')

    async function getAll(userId) {
        let userInterviews = db.get('interviews')
            .filter({ userId: userId })
            .value()
        if (!Array.isArray(userInterviews)) {
            return []
        }
        return userInterviews
    }

    async function get(userId, interviewId) {
        const interview = db.get('interviews')
            .find({ userId: userId, id: interviewId })
            .value()
        if (typeof interview !== 'object') {
            return null
        }
        return interview
    }

    async function add(userId, interview) {
        interview.userId = userId
        interview.id = security.uuid()
        db.get('interviews')
            .push(interview)
            .write()
        return interview
    }

    async function drop(userId, interviewId) {
        const deletedEntries = db.get('interviews')
            .remove({ userId: userId, id: interviewId })
            .write()
        return deletedEntries.length !== 0
    }

    async function update(userId, interview) {
        throw new Error('Not implemented')
    }

    return {
        getAll: getAll,
        get: get,
        add: add,
        drop: drop,
        update: update
    }
})