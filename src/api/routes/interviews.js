/**
 * API for interviews.
 * An interview is always bound to a user.
 * Therefore, every endpoint requires an authentication.
 */

module.exports = (db, security) => {
    const router = require('express').Router()
    const validate = security.validate()
    const messageKeys = require('../util/message-keys')

    /**
     * Get all interviews of a user.
     * If no interviews are found, an empty array is being returned.
     */
    async function getInterviews(req, res) {
        const userId = req.user.data.id
        try {
            const interviews = await db.getInterviews(userId)
            if (interviews === null) {
                return res.status(404).json({
                    message: 'The passed user id ("' + userId + '") was not found in the database',
                    key: messageKeys.INVALID_USER_ID
                })
            }
            return res.send(interviews)
        }
        catch(e) {
            return res.status(500).json({
                message: 'A database error occurred',
                key: messageKeys.DB_ERROR
            })
        }
    }

    /**
     * Get a specific interview of a user by its id.
     * If the interview with the given id does not exists or does not belong to the user,
     * status code 404 is sent.
     */
    async function getInterview(req, res) {
        const userId = req.user.data.id
        const interviewId = req.params.interviewId
        try {
            const interview = await db.getInterview(userId, interviewId)
            if (interview === null) {
                return res.status(404).send()
            }
            return res.json(interview)
        }
        catch(e) {
            return res.status(500).json({
                message: 'A database error occurred',
                key: messageKeys.DB_ERROR
            })
        }
    }

    /**
     * Add a new interview to a user.
     * Sends status 201 if successful.
     */
    async function addInterview(req, res) {
        const userId = req.user.data.id
        const interview = req.body
        const valid = validate['interview'](interview)
        if (!valid) {
            const errors = validate['interview'].errors
            return res.status(400).json({
                message: 'Invalid interview object passed',
                key: messageKeys.SCHEMA_VALIDATION_ERROR,
                errors: errors
            })
        }
        try {
            const createdInterview = await db.addInterview(userId, interview)
            return res.status(201).json(createdInterview)
        }
        catch(e) {
            return res.status(500).json({
                message: 'Interview could not be added to the database because of a datbase error',
                key: messageKeys.DB_ERROR
            })
        }
    }

    /**
     * Delete an interview from a user based on its id.
     * If the interview with the given id does not exists or does not belong to the user,
     * status code 404 is sent.
     * Sends status 204 if successful.
     */
    async function deleteInterview(req, res) {
        const userId = req.user.data.id
        const interviewId = req.params.interviewId
        try {
            const deleted = await db.deleteInterview(userId, interviewId)
            if (deleted) {
                return res.status(204).send()
            }
            return res.status(404).send()
        }
        catch(e) {
            return res.status(500).json({
                message: 'A database error occurred',
                key: messageKeys.DB_ERROR
            })
        }
    }

    /**
     * Update an existing interview.
     */
    async function updateInterview(req, res) {
        res.status(501).send() // not implemented
    }

    router.get('/interviews', security.authMiddleware(), getInterviews)
    router.post('/interviews', security.authMiddleware(), addInterview)
    router.get('/interviews/:interviewId', security.authMiddleware(), getInterview)
    router.put('/interviews/:interviewId', security.authMiddleware(), updateInterview)
    router.delete('/interviews/:interviewId', security.authMiddleware(), deleteInterview)

    return {
        router: router,
        getInterviews: getInterviews,
        getInterview: getInterview,
        addInterview: addInterview,
        deleteInterview: deleteInterview
    }
}