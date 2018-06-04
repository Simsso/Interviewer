require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const src = '../../src/api/'


describe('Status API', () => {
    const statusHandler = require(src + 'routes/status')().status
    describe('GET /status', () => {
        it('responds with 200 OK', () => {
            const req = httpMocks.createRequest(), res = httpMocks.createResponse(), next = sinon.spy()
            statusHandler(req, res, next)
            assert.equal(res._getStatusCode(), 200, 'Response code should be 200.')
            assert.ok(next.notCalled, 'Next should not be called.')
        })

        it('sends a message', () => {
            const req = httpMocks.createRequest(), res = httpMocks.createResponse(), next = sinon.spy()
            statusHandler(req, res, next)
            const resBodyObj = JSON.parse(res._getData())
            assert.equal(resBodyObj.message, 'Online', 'Response body message should be "Online".')
            assert.ok(next.notCalled, 'Next should not be called.')
        })
    })
})