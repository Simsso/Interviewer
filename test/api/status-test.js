require('dotenv').config() // load env variables
const assert = require('assert')
const mocks = require('../mocks')
const src = '../../src/api/'


describe('api', () => {
    const statusHandler = require(src + 'status')().status
    describe('/status', () => {
        it('responds with 200 OK', () => {
            const reqResMock = mocks.reqResNext()
            statusHandler(reqResMock.req, reqResMock.res)
            assert.equal(reqResMock.getSentStatus(), 200)
        })

        it('sends a message', () => {
            const reqResMock = mocks.reqResNext()
            statusHandler(reqResMock.req, reqResMock.res)
            assert.equal(typeof reqResMock.getSentBody(), 'object')
        })
    })
})