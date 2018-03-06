require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const src = '../../src/'


describe('Interviews API', () => {
    const security = require(src + 'security')

    before(() => {
        sinon.stub(security, 'validate').returns({})
    })

    describe('GET /interviews', () => {
        it('responds with the data from the database interface', async () => {
            const interviews = [{ interview: 123 }]
            const dbMock = { getInterviews: sinon.stub().returns(interviews)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { id: '1523' }
            const interviewsRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterviews
            await interviewsRoute(req, res)
            assert.equal(res._getStatusCode(), 200, 'Status code should be 200.')
            assert.equal(interviews, res._getData(), 'Should forward the data from the database.')
        })

        it('reads the user id and passes it to the database interface', async () => {
            const dbMock = { getInterviews: sinon.stub().returns([])}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { id: '1523' }
            const interviewsRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterviews
            await interviewsRoute(req, res)
            assert.ok(dbMock.getInterviews.calledOnce, 'Database should be called exactly once.')
            assert.ok(dbMock.getInterviews.calledWithExactly(req.user.id), 'Should call the database interface with the user ID which is stored in the request object.')
        })

        it('responds with 500 if the database throws an error', async () => {
            const dbMock = { getInterviews: sinon.stub().throws(new Error('Mock error: Database not available'))}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { id: '1523' }
            const interviewRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterviews
            await interviewRoute(req, res)
            assert.equal(res._getStatusCode(), 500, 'Should respond with 500 status code if the database throws an error')
            const resObj = JSON.parse(res._getData())
            assert.deepEqual(resObj.key, 'DATABASE_ERROR', 'Should send an error key')
            assert.equal(typeof resObj.message, 'string', 'Should send an error message.')
        })
    })

    describe('GET /interview/:interviewId', () => {
        const interview = { id: 123 }
        it('responds with the data from the database interface', async () => {
            const dbMock = { getInterview: sinon.stub().returns(interview)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { id: '1523' }
            const interviewRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterview
            await interviewRoute(req, res)
            assert.equal(res._getStatusCode(), 200, 'Status code should be 200.')
            assert.deepEqual(interview, JSON.parse(res._getData()), 'Should forward the data from the database.')
        })

        it('reads user id and interview id and passes it to the database interface', async () => {
            const dbMock = { getInterview: sinon.stub().returns(interview)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { id: '1523' }
            const interviewRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterview
            await interviewRoute(req, res)
            assert.ok(dbMock.getInterview.calledOnce, 'Database should be called exactly once.')
            assert.ok(dbMock.getInterview.calledWithExactly(req.user.id, interview.id), 'Database should be called with user id and interview id.')
        })

        it('responds with 404 if the database returns null', async () => {
            const dbMock = { getInterview: sinon.stub().returns(null)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { id: '1523' }
            const interviewRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterview
            await interviewRoute(req, res)
            assert.equal(res._getStatusCode(), 404, 'Should respond with 404 status code if the database returns null')
            assert.equal(res._getData(), '', 'Should send an empty response body')
        })

        it('responds with 500 if the database throws an error', async () => {
            const dbMock = { getInterview: sinon.stub().throws(new Error('Mock error: Database not available'))}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { id: '1523' }
            const interviewRoute = require(src + 'api/routes/interviews')(dbMock, security).getInterview
            await interviewRoute(req, res)
            assert.equal(res._getStatusCode(), 500, 'Should respond with 500 status code if the database throws an error')
            const resObj = JSON.parse(res._getData())
            assert.deepEqual(resObj.key, 'DATABASE_ERROR', 'Should send an error key')
            assert.equal(typeof resObj.message, 'string', 'Should send an error message.')
        })
    })

    after(() => {
        security.validate.restore()
    })
})
