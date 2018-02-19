module.exports = (() => {
    /**
     * Add a new user to the database.
     * @param {object} user New user object, which matches the user.json schema.
     */
    function addUser(user) {
        user.id = "randomID"
        console.log(user)
        return user
    }

    return {
        addUser: addUser
    }
})()