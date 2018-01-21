module.exports = (() => {
    const jwt = require('jsonwebtoken')

    /**
     * Generate a new JWT token with the given data.
     * @param {object} data Data to save in the JWT token.
     * @param {number} expires Seconds until the token expires.
     * @returns {string} JWT token.
     */
    function generateToken(data, expires) {
        return jwt.sign({ data: data }, process.env.TOKEN_SECRET, { expiresIn: expires })
    }

    /**
     * Verifies a JWT token.
     * @param {string} token Token string.
     * @param {function} callback Callback taking (err: object, data: object) whereas the latter is only set if valid.
     */
    function verifyToken(token, callback) {
        jwt.verify(token, process.env.TOKEN_SECRET, {}, callback)
    }

    
    function authMiddleware() {
        return (req, res, next) => {
            const authHeader = req.header('authorization')
            if (typeof authHeader !== 'string' || authHeader.length < 'Bearer x.x.x'.length) {
                return res.status(401).json({ message: 'Authorization required'})
            }
            const token = authHeader.substring('Bearer '.length)
            try {
                const data = verifyToken(token)
                // TODO: implement role check
                req.user = data
                return next()
            }
            catch(err) {
                return res.status(403).json({ message: 'Invalid token', err: err })
            }
        }
    }

    return {
        generateToken: generateToken,
        authMiddleware: authMiddleware
    }
})()