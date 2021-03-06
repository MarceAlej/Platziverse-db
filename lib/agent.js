'use strict'

const AgentModel = require('../index')

module.exports = function setupAgent(AgentModel) {
    function findById (id) {
        return AgentModel.findById(id)
    }
    
    return {
        findById
    }
}