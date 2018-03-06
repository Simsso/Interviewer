require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const src = '../src/'

describe('Database interface', () => {
    const dbModule = require(src + 'db-interface')

    describe('Users', () => {
        const db = dbModule('test')
        before(db.reset)

        it('add and get user', async () => {
            const user = {
                username: "Username", 
                email: "mail@test.com",
                password: "Secret1234"
            }
            const createdUser = await db.addUser(user)
            const retrievedUser = await db.getUser(createdUser.username)

            assert.equal(typeof createdUser, 'object', 'Create method should return a user object.')
            assert.deepEqual(createdUser, retrievedUser, 'Created user should equal the user that is returned when retrieving based on ID.')
        })

        after(db.reset)
    })
})