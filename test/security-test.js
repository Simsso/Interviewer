require('dotenv').config() // load env variables
const assert = require('assert')
const mocks = require('./mocks')
const src = '../src/'


describe('security', () => {
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

        it('rejects missing tokens with error 401', (done) => {
            const mock = mocks.reqResNext()
            fn(mock.req, mock.res, mock.next)
            assert.equal(mock.getSentStatus(), 401, 'Sent status code is not equal to 401.')
            assert.equal(mock.getNextCount(), 0, 'Next should not be called for missing tokens.')
            done()
        })

        it('rejects invalid tokens with error 403', (done) => {
            const mock = mocks.reqResNext()
            mock.req.headers['authorization'] = 'Bearer 123.123.123'
            fn(mock.req, mock.res, mock.next)
            assert.equal(mock.getSentStatus(), 403, 'Sent status code is not equal to 403.')
            assert.equal(mock.getNextCount(), 0, 'Next should not be called for invalid tokens.')
            done()
        })

        it('rejects expired tokens with error 403', (done) => {
            const mock = mocks.reqResNext()
            mock.req.headers['authorization'] = 'Bearer ' + security.generateToken({}, -1000)
            fn(mock.req, mock.res, mock.next)
            assert.equal(mock.getSentStatus(), 403, 'Sent status code is not equal to 403.')
            assert.equal(mock.getNextCount(), 0, 'Next should not be called for invalid tokens.')
            done()
        })

        it('accepts valid tokens', (done) => {
            const mock = mocks.reqResNext()
            mock.req.headers['authorization'] = 'Bearer ' + security.generateToken({}, 1000)
            fn(mock.req, mock.res, mock.next)
            assert.equal(typeof mock.getSentStatus(), 'undefined', 'Should not send response for valid tokens.')
            assert.equal(mock.getNextCount(), 1, 'Next must be called exactly once.')
            done()
        })
    })
})