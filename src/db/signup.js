module.exports = ((db) => {
    const security = require('../security')

    /**
     * Add a new user to the database.
     * @param {object} user New user object, which matches the user.json schema.
     */
    async function addUser(user) {
        user.id = security.uuid()
        const hash = await security.hashPassword(user.password)
        delete user.password
        user.password = hash
        db.get('users').push(user).write()
        return user
    }

    return {
        addUser: addUser
    }
})