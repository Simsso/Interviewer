require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')
const src = '../src/'


describe('Security', () => {
    const security = require(src + 'security')
    describe('JSON web token generation', () => {
        it('returns a string', () => {
            const token = security.generateToken({}, 1000)
            assert.equal(typeof token, 'string')
        })
        
        it ('handles negative expiration durations', () => {
            const token = security.generateToken({}, -1000)
            assert.equal(typeof token, 'string')
        })
    })

    describe('JSON web token verification', () => {
        it('rejects invalid tokens', async () => {
            const invalidToken = 'token'
            try {
                await security.verifyToken(invalidToken)
                return Promise.reject('Token verification did not throw an error for an invalid token.')
            }
            catch(e) {
                return Promise.resolve()
            }
        })

        it ('accepts valid tokens', async () => {
            const validToken = security.generateToken({}, 100)
            try {
                const tokenPayload = await security.verifyToken(validToken)
                assert.equal(typeof tokenPayload, 'object', 'Verification should return an object.')
            }
            catch(e) {
                return Promise.reject('Token parsing failed with an exception. ' + e.message)
            }
        })

        it ('unpacks the token body', async () => {
            const tokenBody = { value: 123 }
            const validToken = security.generateToken(tokenBody, 100)
            try {
                const parsed = await security.verifyToken(validToken)
                assert.deepEqual(parsed.data, tokenBody, 'Verification should return the token content.')
            }
            catch(e) {
                return Promise.reject('Token parsing failed with an exception. ' + e.message)
            }
        })
    })

    describe('authorization middleware', () => {
        const fn = security.authMiddleware()

        it('returns a function', () => {
            assert.equal(typeof fn, 'function')
        })

        it('rejects missing tokens with error 401', async () => {
            const req = httpMocks.createRequest(), res = httpMocks.createResponse(), next = sinon.spy()
            await fn(req, res, next)
            assert.equal(res._getStatusCode(), 401, 'Sent status code is not equal to 401.')
            assert.ok(next.notCalled, 'Next should not be called for missing tokens.')
        })

        it('rejects invalid tokens with error 403', async () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer 123.123.123' }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            await fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
        })

        it('rejects expired tokens with error 403', async () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, -1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            await fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
        })

        it('accepts valid tokens', async () => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, 1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            await fn(req, res, next)
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

    describe('password hashing', () => {
        it('returns an object with salt, hash, iterations', async () => {
            const password = '1234'
            try {
                const result = await security.hashPassword(password)
                assert.equal(typeof result, 'object', 'Hashing result should be an object.')
                assert.equal(typeof result.salt, 'string', 'Hashing result should contain a salt of type string.')
                assert.equal(typeof result.hash, 'string', 'Hashing result should contain a hash of type string.')
                assert.equal(typeof result.iterations, 'number', 'Hashing result should contain an iterations count of type number.')
            }
            catch(e) {
                return Promise.reject('Password hashing failed with an exception. ' + e.message)
            }
        })

        it('generates non-empty salt and hash', async () => {
            const password = '12345'
            try {
                const result = await security.hashPassword(password)
                assert.ok(result.salt.length > 0, 'Hashing result should contain a non-empty salt.')
                assert.ok(result.hash.length > 0, 'Hashing result should contain a non-empty hash.')
            }
            catch(e) {
                return Promise.reject('Password hashing failed with an exception. ' + e.message)
            }
        })

        it('forwards errors from pbkdf2', async () => {
            const crypto = require('crypto')
            const errorObj = {}
            
            const pbkdf2Stub = sinon.stub(crypto, 'pbkdf2').callsFake((a, b, c, d, e, callback) => {
                callback(errorObj)
            })

            try {
                const hash = await security.hashPassword('')
                return Promise.reject('Password validation did not fail despite pbkdf2 throwing an error.')
            }
            catch(e) {
                assert.equal(e, errorObj, 'Should forward error object from bpkdf2.')
                return Promise.resolve()
            }
            finally {
                pbkdf2Stub.restore()
            }
        })
    })

    describe('password validation', () => {
        it('rejects an invalid password', async () => {
            try {
                const password = '1234', wrongPassword = 'abc'
                const hash = await security.hashPassword(password)
                const valid = await security.validatePassword(hash.hash, hash.salt, hash.iterations, wrongPassword)
                assert.ok(!valid, 'Invalid password should be rejected.')
            }
            catch(e) {
                return Promise.reject('Password validation failed with an exception. ' + e.message)
            }
        })

        it('accepts an invalid password', async () => {
            try {
                const password = '1234'
                const hash = await security.hashPassword(password)
                const valid = await security.validatePassword(hash.hash, hash.salt, hash.iterations, password)
                assert.ok(valid, 'Valid password should be accepted.')
            }
            catch(e) {
                return Promise.reject('Password validation failed with an exception. ' + e.message)
            }
        })

        it('forwards errors from pbkdf2', async () => {
            const crypto = require('crypto')
            const errorObj = {}
            
            const pbkdf2Stub = sinon.stub(crypto, 'pbkdf2').callsFake((a, b, c, d, e, callback) => {
                callback(errorObj)
            })

            try {
                const valid = await security.validatePassword('', '', 0, '1234')
                return Promise.reject('Password validation did not fail despite pbkdf2 throwing an error.')
            }
            catch(e) {
                assert.equal(e, errorObj, 'Should forward error object from bpkdf2.')
                return Promise.resolve()
            }
            finally {
                pbkdf2Stub.restore()
            }
        })
    })

    describe('uuid generation', () => {
        it('returns a string', () => {
            assert.equal(typeof security.uuid(), 'string', 'Uuid should be a string.')
        })
    })
})