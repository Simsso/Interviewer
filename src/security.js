const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const uuidv4 = require('uuid/v4')

const routeUtil = require('./api/util/route-util')

const hashlen = parseInt(process.env['HASH_LENGTH'], 10), 
    digest = process.env['HASH_ALGORITHM'], 
    iterations = parseInt(process.env['HASH_ITERATIONS'], 10), 
    saltlen = parseInt(process.env['SALT_LENGTH'], 10)

function getValidationFunctions() {
    return routeUtil.loadSchemas(['user', 'interview'])
}

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
 */
async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.TOKEN_SECRET, {}, (err, data) => {
            if (err) return reject(err)
            return resolve(data)
        })
    })
}

/** 
 * Authentication middleware for express.
 * Checks whether the request header 'Authorization' contains a valid JSON web token.
 * If so, the request object is extended by a user attribute which contains the token value.
 * Otherwise, status 403 is sent and next is not being called.
 */
function authMiddleware() {
    return async (req, res, next) => {
        const authHeader = req.header('authorization')
        if (typeof authHeader !== 'string' || authHeader.length < 'Bearer x.x.x'.length) {
            return res.status(401).json({ message: 'Authorization required'})
        }
        const token = authHeader.substring('Bearer '.length)
        try {
            const data = await verifyToken(token)
            // TODO: implement role check
            req.user = data
            return next()
        }
        catch(err) {
            return res.status(403).json({ message: 'Invalid token', err: err })
        }
    }
}

/**
 * Hashes a password and resolves with salt, hash, and number of iterations.
 * Rejects, if the encryption library throws an error.
 * @param {string} password to hash.
 */
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(saltlen).toString('base64')
        crypto.pbkdf2(password, salt, iterations, hashlen, digest, (err, derivedKey) => {
            if (err) return reject(err)
            return resolve({
                salt: salt,
                hash: derivedKey.toString('hex'),
                iterations: iterations
            })
        })
    })
}

/**
 * Validates a password against encrypted password information, i.e. hash, salt, and iterations.
 * Resolves with true, if the password matches the hash-salt-iterations combination.
 * Resolves with false, if the password does not match.
 * Rejects, if the encryption library throws an error.
 * @param {string} hash of a stored password.
 * @param {string} salt of a stored password.
 * @param {string} storedIterations that were used to generated the passed hash.
 * @param {string} password which will be validated against the hash.
 */
async function validatePassword(hash, salt, storedIterations, password) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, storedIterations, hashlen, digest, (err, derivedKey) => {
            if (err) return reject(err)
            return resolve(derivedKey.toString('hex') === hash)
        })
    })
}

/** 
 * @returns {string} pseudo-random, generated uuid.
 */
function uuid() {
    return uuidv4()
}

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    authMiddleware: authMiddleware,
    validate: getValidationFunctions,
    hashPassword: hashPassword,
    validatePassword: validatePassword,
    uuid: uuid
}