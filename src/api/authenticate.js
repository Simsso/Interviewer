module.exports = (db, security) => {
    const router = require('express').Router()
    const basicAuth = require('basic-auth')

    function authenticate(req, res) {
        const credentials = basicAuth.parse(req.get('authorization'))
    
        if (typeof credentials === 'undefined') return res.status(400).json({ message: 'Authentication header with Basic auth required' })
        const userName = credentials.name
    
        if (!db.validCredentials(userName, credentials.pass)) {
            // invalid credentials
            return res.status(403).json({ message: 'Invalid credentials' })
        }
    
        const expirationTime = 1000
        const token = security.generateToken(db.getTokenPayload(userName), expirationTime)
    
        res.json({
            message: 'Credentials accepted',
            token: token,
            expirationInSeconds: expirationTime
        })
    }
    
    /**
     * Endpoint that generates JWT access tokens for valid credentials.
     * The credentials are transmitted in the authorization request header in Basic encoding (base 64).
     */
    router.get('/authenticate', authenticate)

    return {
        router: router,
        authenticate: authenticate
    }
}