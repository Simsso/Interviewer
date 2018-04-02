require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const src = '../../src/'
const messageKeys = require(src + 'api/util/message-keys')


describe('Interviews API', () => {
    const security = require(src + 'security')
    const interviewsModule = require(src + 'api/routes/interviews')

    describe('GET /interviews', () => {
        before(() => {
            sinon.stub(security, 'validate').returns({})
        })

        function getGetRoute(dbMock) {
            return interviewsModule(dbMock, security).getInterviews
        }

        it('responds with the data from the DB interface and passes request data to it', async () => {
            const interviews = [{ interview: 123 }]
            const dbMock = { getInterviews: sinon.stub().returns(interviews)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 200, 'Status code should be 200.')
            assert.equal(interviews, res._getData(), 'Should forward the data from the db.')
            assert.ok(dbMock.getInterviews.calledOnce, 'DB should be called exactly once.')
            assert.ok(dbMock.getInterviews.calledWithExactly(req.user.data.id), 'Should call the DB interface with the user ID which is stored in the request object.')
        })

        it('responds with 404 if the DB returns null', async () => {
            const dbMock = { getInterviews: sinon.stub().returns(null)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)
            const resObj = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 404, 'Should respond with 404 status code if the DB returns null')
            assert.equal(resObj.key, messageKeys.INVALID_USER_ID, 'Should send the INVALID_USER_ID error key')
            assert.ok(resObj.message, 'Should send a descriptive error message')
        })

        it('responds with 500 if the DB throws an error', async () => {
            const dbMock = { getInterviews: sinon.stub().throws(new Error('Mock error: DB not available'))}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)
            const resObj = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 500, 'Should respond with 500 status code if the DB throws an error')
            assert.equal(typeof resObj.message, 'string', 'Should respond with a descriptive error message.')
            assert.deepEqual(resObj.key, messageKeys.DB_ERROR, 'Should send an error key.')
            assert.equal(typeof resObj.message, 'string', 'Should send an error message.')
        })

        after(() => {
            security.validate.restore()
        })
    })

    describe('GET /interview/:interviewId', () => {
        before(() => {
            sinon.stub(security, 'validate').returns({})
        })

        const interview = { id: 123 }
        function getGetRoute(dbMock) {
            return interviewsModule(dbMock, security).getInterview
        }

        it('passes parameters to and responds with the data from the DB interface', async () => {
            const dbMock = { getInterview: sinon.stub().returns(interview)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 200, 'Status code should be 200.')
            assert.deepEqual(interview, JSON.parse(res._getData()), 'Should forward the data from the db.')
            assert.ok(dbMock.getInterview.calledOnce, 'DB should be called exactly once.')
            assert.ok(dbMock.getInterview.calledWithExactly(req.user.data.id, interview.id), 'DB should be called with user id and interview id.')
        })

        it('responds with 404 if the DB returns null', async () => {
            const dbMock = { getInterview: sinon.stub().returns(null)}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 404, 'Should respond with 404 status code if the DB returns null')
            assert.equal(res._getData(), '', 'Should send an empty response body')
        })

        it('responds with 500 if the DB throws an error', async () => {
            const dbMock = { getInterview: sinon.stub().throws(new Error('Mock error: DB not available'))}
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setParameter('interviewId', interview.id)
            req.user = { data: { id: '1523' } }
            await getGetRoute(dbMock)(req, res)
            const resObj = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 500, 'Should respond with 500 status code if the DB throws an error')
            assert.equal(typeof resObj.message, 'string', 'Should respond with a descriptive error message.')
            assert.equal(resObj.key, messageKeys.DB_ERROR, 'Should send an error key')
        })

        after(() => {
            security.validate.restore()
        })
    })

    describe('POST /interviews', () => {
        const validInterview = {
            name: 'Weight Tracking',
            questions: [{ question: 'What\'s the current weight?' }],
            weekday: 0
        }, validInterviewWithId = {
            id: '12038',
            name: 'Weight Tracking',
            questions: [{ question: 'What\'s the current weight?' }],
            weekday: 0
        }

        function getAddRoute(dbMock) {
            return interviewsModule(dbMock, security).addInterview
        }

        it('deals with invalid payloads', async () => {
            const dbMock = { addInterview: sinon.stub().returns(validInterviewWithId) }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setBody({ invalid: 'payload' })
            req.user = { data: { id: '1523' } }
            getAddRoute(dbMock)(req, res)
            const resBody = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 400, 'Should respond with invalid request.')
            assert.equal(typeof resBody.message, 'string', 'Response contains a message.')
            assert.equal(resBody.key, messageKeys.SCHEMA_VALIDATION_ERROR, 'Should respond with an error key.')
            assert.ok(!dbMock.addInterview.called, 'Should not call the DB add method.')
            assert.ok(Array.isArray(resBody.errors), 'Should send an array of schema validation errors.')
        })

        it('passes a valid object to the DB and responds with the DB return value', async () => {
            const dbMock = { addInterview: sinon.stub().returns(validInterviewWithId) }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setBody(validInterview)
            req.user = { data: { id: '1523' } }
            await getAddRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 201, 'Should respond with created status code.')
            assert.deepEqual(JSON.parse(res._getData()), validInterviewWithId, 'Should respond with the object that was returned by the DB interface.')
            assert.ok(dbMock.addInterview.calledOnce, 'Should call the add interface exactly once.')
            assert.ok(dbMock.addInterview.calledWithExactly(req.user.data.id, validInterview), 'Add interview DB interface should be called with the request payload and user ID.')
        })

        it('handles DB errors', async () => {
            const dbMock = { addInterview: sinon.stub().throws('Mock error: DB not available') }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req._setBody(validInterview)
            req.user = { data: { id: '1523' } }
            getAddRoute(dbMock)(req, res)
            const resBody = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 500, 'Should send internal server error status code.')
            assert.ok(dbMock.addInterview.calledOnce, 'Should call the add interface exactly once.')
            assert.equal(typeof resBody.message, 'string', 'Should respond with a descriptive error message.')
            assert.equal(resBody.key, messageKeys.DB_ERROR, 'Should send an error key')
        })
    })

    describe('DELETE /interview/:interviewId', () => {
        const mockInterviewId = '12323'

        function getDeleteRoute(dbMock) {
            return interviewsModule(dbMock, security).deleteInterview
        }

        it('responds with 204 if interviewId is valid', async () => {
            const dbMock = { deleteInterview: sinon.stub().returns(true) }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            req._setParameter('interviewId', mockInterviewId)
            await getDeleteRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 204, 'Should respond with 204 status code.')
            assert.equal(res._getData(), '', 'Should send an empty response.')
            assert.ok(dbMock.deleteInterview.called, 'Should call the DB delete interface.')
            assert.ok(dbMock.deleteInterview.calledWith(req.user.data.id, mockInterviewId), 'Should call DB interface with user ID and interview ID.')
        })

        it('responds with 404 if the interviewId is invalid', async () => {
            const dbMock = { deleteInterview: sinon.stub().returns(false) } // return false indicates invalid ID
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            req._setParameter('interviewId', mockInterviewId)
            await getDeleteRoute(dbMock)(req, res)

            assert.equal(res._getStatusCode(), 404, 'Should respond with not found status code.')
            assert.equal(res._getData(), '', 'Should send an empty response.')
        })

        it('responds with 500 if the DB throws an error', async () => {
            const dbMock = { deleteInterview: sinon.stub().throws(new Error('Mock error: DB not available')) }
            const req = httpMocks.createRequest(), res = httpMocks.createResponse()
            req.user = { data: { id: '1523' } }
            req._setParameter('interviewId', mockInterviewId)
            await getDeleteRoute(dbMock)(req, res)
            const resObj = JSON.parse(res._getData())

            assert.equal(res._getStatusCode(), 500, 'Should respond with not found status code.')
            assert.equal(typeof resObj.message, 'string', 'Should respond with a descriptive error message.')
            assert.equal(resObj.key, messageKeys.DB_ERROR, 'Should send an error key')
        })
    })
})
