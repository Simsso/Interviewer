require('dotenv').config() // load env variables
const assert = require('assert')
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
        
        function getReqResNextMock() {
            let sentStatus, tmpStatus, nextCalled = 0
        
            const reqMock = { 
                header: (key) => reqMock.headers[key],
                headers: []
            }
        
            const resMock = {
                status: (statusCode) => {
                    tmpStatus = statusCode
                    return resMock
                },
                json: (resBody) => {
                    sentStatus = tmpStatus
                    return resMock
                }
            }
        
            const next = () => nextCalled++
            
            return {
                req: reqMock,
                res: resMock,
                next: next,
                getSentStatus: () => sentStatus,
                getNextCount: () => nextCalled
            }
        }

        it('returns a function', () => {
            assert.equal(typeof fn, 'function')
        })

        it('rejects missing tokens with error 401', (done) => {
            const mock = getReqResNextMock()
            fn(mock.req, mock.res, mock.next)
            assert.equal(mock.getSentStatus(), 401, 'Sent status code is not equal to 401.')
            assert.equal(mock.getNextCount(), 0, 'Next should not be called for missing tokens.')
            done()
        })

        it('rejects invalid tokens with error 403', (done) => {
            const mock = getReqResNextMock()
            mock.req.headers['authorization'] = 'Bearer 123.123.123'
            fn(mock.req, mock.res, mock.next)
            assert.equal(mock.getSentStatus(), 403, 'Sent status code is not equal to 403.')
            assert.equal(mock.getNextCount(), 0, 'Next should not be called for invalid tokens.')
            done()
        })

        it('accepts valid tokens', (done) => {
            const mock = getReqResNextMock()
            mock.req.headers['authorization'] = 'Bearer ' + security.generateToken({}, 1000)
            fn(mock.req, mock.res, mock.next)
            assert.equal(typeof mock.getSentStatus(), 'undefined', 'Should not send response for valid tokens.')
            assert.equal(mock.getNextCount(), 1, 'Next must be called exactly once.')
            done()
        })
    })
})