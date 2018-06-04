const Ajv = require('ajv')
const ajv = new Ajv()

/**
 * @param {Express} app Express app
 * @param {string[]} routes Name of the routes to register. Each route name is the file name of the module that exports an express Route object.
 * @param {object} db interface for a database.
 * @param {object} security util object.
 */
function registerRoutes(app, routes, db, security) {
    const apiPrefix = '/api/v1'
    for (let route of routes) {
        app.use(apiPrefix, require('../routes/' + route)(db, security).router)
    }
}

/**
 * @param {string[]} schemaNames of files located in the schema folder ('.json' is automatically appended).
 * @returns {object} of validation functions where the keys correspond to the passed strings.
 */
function loadSchemas(schemaNames) {
    const schemaValidators = {}
    for (let i in schemaNames) {
        const schemaName = schemaNames[i]
        schemaValidators[schemaName] = ajv.compile(require('../schema/' + schemaName + '.json'))
    }
    return schemaValidators
}

module.exports = {
    registerRoutes: registerRoutes,
    loadSchemas: loadSchemas
}