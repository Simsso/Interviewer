require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const src = '../src/'


describe('Security', () => {
    const security = require(src + 'security')
    describe('generateToken', () => {
        it('returns a string', () => {
            const token = security.generateToken({}, 1000)
            assert.equal(typeof token, 'string')
        })
        
        it ('handles negative expiration durations', () => {
            const token = security.generateToken({}, -1000)
            assert.equal(typeof token, 'string')
        })
    })

    describe('authMiddleware', () => {
        const fn = security.authMiddleware()

        it('returns a function', () => {
            assert.equal(typeof fn, 'function')
        })

        it('rejects missing tokens with error 401', () => {
            const req = httpMocks.createRequest(), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 401, 'Sent status code is not equal to 401.')
            assert.ok(next.notCalled, 'Next should not be called for missing tokens.')
        })

        it('rejects invalid tokens with error 403', () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer 123.123.123' }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
        })

        it('rejects expired tokens with error 403', () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, -1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
        })

        it('accepts valid tokens', () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, 1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.ok(!res._isEndCalled(), 'Should not send any response for valid tokens from inside the middleware.')
            assert.ok(next.calledOnce, 'Next must be called exactly once.')
        })
    })

    describe('schema validation', () => {
        const validate = security.validate()

        describe('user.json', () => {
            const userValidation = validate['user']

            it('rejects invalid user objects', () => {
                const invalidUsers = [
                    {},
                    { username: 'asdf' },
                    { email: 'a' },
                    { password: 'Secret1' },
                    { username: '   ', email: 'test@test.com', password: 'Secret!' },
                    { username: 'a', email: 'test[at]abc.com', password: 'Secret!' },
                    { username: 'a', email: 'test@abc.', password: 'Secret!' },
                    { username: '', email: 'test@abc.de', password: 'Secret!' }
                ]

                invalidUsers.forEach(u => {
                    assert.ok(!userValidation(u), 'Invalid user should be rejected.')
                })
            })

            it('accepts valid user objects', () => {
                const validUsers = [
                    { username: 'Simsso', email: 'test@gmail.com', password: 'Secret!' },
                    { username: 'a', email: 'test@abc.com', password: 'AVeryLongPasswordOverHere!' }
                ]

                validUsers.forEach(u => {
                    assert.ok(userValidation(u), 'Valid user should be accepted. Reason ' + userValidation.errors)
                })
            })
        })
    })
})