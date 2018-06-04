require('dotenv').config() // load env variables
const assert = require('assert')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const src = '../src/api/util/'

describe('Route utilities', () => {
    describe('route registration', () => {
        it('calls app.use for each route', () => {
            const useStub = sinon.stub()
            const appMock = { use: useStub }
            const routeStub = sinon.stub().returns({})
            const routeUtil = proxyquire.noCallThru()(src + 'route-util', { 
                '../routes/routeA': routeStub,
                '../routes/routeB': routeStub
            })
            routeUtil.registerRoutes(appMock, ['routeA', 'routeB'], {}, {})
            proxyquire.callThru()
            assert.ok(useStub.calledTwice, 'Should register two routes with app.use.')
        })

        it('calls app.use with db and security object', () => {
            const appMock = { use: sinon.stub() }
            const moduleReturnMock = {}, dbMock = {}, securityMock = {}
            const routeStub = sinon.stub().returns(moduleReturnMock)
            const routeUtil = proxyquire.noCallThru()(src + 'route-util', { 
                '../routes/routeA': routeStub,
                '../routes/routeB': routeStub
            })
            routeUtil.registerRoutes(appMock, ['routeA', 'routeB'], dbMock, securityMock)
            proxyquire.callThru()
            assert.ok(
                routeStub.calledWith(dbMock, securityMock), 
                'Should pass db and security object to the modules.'
            )
        })
    })
})