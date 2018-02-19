require('dotenv').config() // load env variables
const assert = require('assert')


describe('Environment variables', () => {
    function itIsDefined(envVariable) {
        it('is defined', () => {
            assert.equal(typeof process.env[envVariable], 'string')
        })
    }

    function describeIsANumber(envVariables) {
        if (typeof envVariables === 'string') envVariables = [envVariables]
        envVariables.forEach((val) => {
            describe(val, () => {
                itIsDefined(val)
                it('is a number', () => {
                    assert.equal(process.env[val], parseInt(process.env[val], 10))
                })
            })
        })
    }

    function describeDefined(envVariables) {
        if (typeof envVariables === 'string') envVariables = [envVariables]
        envVariables.forEach((val) => {
            describe(val, () => {
                itIsDefined(val)
            })
        })
    }

    describeIsANumber('PORT')
    describeDefined('TOKEN_SECRET')
    describeIsANumber('DB_PORT')
    describeDefined(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'])
})
