module.exports = ((db) => {
    const security = require('../security')

    async function getAll(userId) {
        throw new Error('Not implemented')
    }

    async function get(userId, interviewId) {
        throw new Error('Not implemented')
    }

    async function add(userId, interview) {
        throw new Error('Not implemented')
    }

    async function drop(userId, interviewId) {
        throw new Error('Not implemented')
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