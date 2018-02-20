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
        envVariables.forEach(val => {
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

    describe('application', () => {
        describeIsANumber('PORT')
    })

    describe('security', () => {
        describeDefined(['TOKEN_SECRET', 'HASH_ALGORITHM', 'HASH_LENGTH', 'HASH_ITERATIONS', 'SALT_LENGTH'])
        describeIsANumber(['HASH_LENGTH', 'HASH_ITERATIONS', 'SALT_LENGTH'])
    })
    
    describe('database', () => {
        describeIsANumber('DB_PORT')
        describeDefined(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'])
    })
})