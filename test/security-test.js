require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
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
            const req = httpMocks.createRequest(), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 401, 'Sent status code is not equal to 401.')
            assert.ok(next.notCalled, 'Next should not be called for missing tokens.')
            done()
        })

        it('rejects invalid tokens with error 403', (done) => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer 123.123.123' }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
            done()
        })

        it('rejects expired tokens with error 403', (done) => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, -1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.equal(res._getStatusCode(), 403, 'Sent status code is not equal to 403.')
            assert.ok(next.notCalled, 0, 'Next should not be called for invalid tokens.')
            done()
        })

        it('accepts valid tokens', (done) => {
            const req = httpMocks.createRequest({
                headers: { 'Authorization': 'Bearer ' + security.generateToken({}, 1000) }
            }), res = httpMocks.createResponse(), next = sinon.spy()
            fn(req, res, next)
            assert.ok(!res._isEndCalled(), 'Should not send any response for valid tokens from inside the middleware.')
            assert.ok(next.calledOnce, 'Next must be called exactly once.')
            done()
        })
    })
})