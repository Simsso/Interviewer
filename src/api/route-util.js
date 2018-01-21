module.exports = (() => {
    const Ajv = require('ajv')
    const ajv = new Ajv()

    const security = require('../security')

    /**
     * @param {Express} app Express app
     * @param {string[]} routes Name of the routes to register. Each route name is the file name of the module that exports an express Route object.
     */
    function registerRoutes(app, routes, db, security) {
        const apiPrefix = '/api/v1'
        for (let route of routes) {
            app.use(apiPrefix, require('./' + route)(db, security).router)
        }
    }


    /**
     * @param {string[]} schemaNames Names of files located in the schema folder ('.json' is automatically appended).
     * @returns {object} Object of validation functions where the keys correspond to the passed strings.
     */
    function loadSchemas(schemaNames) {
        const schemaValidators = {}
        for (let i in schemaNames) {
            const schemaName = schemaNames[i]
            schemaValidators[schemaName] = ajv.compile(require('./schema/' + schemaName + '.json'))
        }
        return schemaValidators
    }

    return {
        registerRoutes: registerRoutes,
        loadSchemas: loadSchemas
    }
})()