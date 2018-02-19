require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const src = '../../src/api/'


describe('Users API', () => {
    describe('POST /users', () => {
        it('handles invalid request payload', async () => {
            const validateMock = { user: sinon.stub().returns(false) }
            const dbMock = undefined, 
                securityMock = { validate: () => validateMock }
            const req = httpMocks.createRequest({
                body: {}
            }), res = httpMocks.createResponse()

            const usersHandler = require(src + 'routes/users')(dbMock, securityMock).addUser
            await usersHandler(req, res)

            assert.equal(res._getStatusCode(), 400, 'Should not accept an empty object as request payload.')
            assert.equal(JSON.parse(res._getData()).message, 'Invalid user object passed', 'Should send a descriptive error message.')
            assert.ok(validateMock.user.calledOnce, 'Validation schema should be used.')
        })

        it('creates a user', async () => {
            const validRequestBody = {
                username: "Username", 
                email: "mail@test.com",
                password: "Secret1234"
            }
            const createdUser = {
                id: "random-uuid",
                username: "Username", 
                email: "mail@test.com",
                password: "Secret1234"
            }
            const validateMock = { user: sinon.stub().returns(true) }
            const dbMock = { addUser: sinon.stub().returns(createdUser) }, 
                securityMock = { validate: () => validateMock }
            const req = httpMocks.createRequest({
                body: validRequestBody
            }), res = httpMocks.createResponse()

            const usersHandler = require(src + 'routes/users')(dbMock, securityMock).addUser
            await usersHandler(req, res)

            assert.equal(res._getStatusCode(), 201, 'Should respond with status code 201.')
            assert.deepEqual(JSON.parse(res._getData()), createdUser, 'Endpoint should return the object which the database provides.')
            assert.ok(validateMock.user.calledOnce, 'Validation function should be used to check payload.')
            assert.ok(validateMock.user.calledWith(validRequestBody), 'Validation function should be called with request payload.')
            assert.ok(dbMock.addUser.calledWith(validRequestBody), 'New user should equal request payload.')
        })

        it('handles database error', async () => {
            const validateMock = { user: sinon.stub().returns(true) }
            const dbMock = { addUser: sinon.stub().throws(new Error('Database not reachable')) }, 
                securityMock = { validate: () => validateMock }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()

            const usersHandler = require(src + 'routes/users')(dbMock, securityMock).addUser
            await usersHandler(req, res)

            assert.equal(res._getStatusCode(), 500, 'Should respond with status code 500.')
            assert.equal(
                JSON.parse(res._getData()).message, 
                'User could not be added to the database because of an internal error',
                'Should send a descriptive error message.'
            )
            assert.ok(dbMock.addUser.calledOnce, 'Should try to add the new user object.')
        })
    })
})
