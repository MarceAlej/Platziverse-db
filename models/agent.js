'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupAgentModel (config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('agent', {
    uuid: {
      type: Sequelize.STRING,
      allownull: false
    },
    username: {
      type: Sequelize.STRING,
      allownull: false
    },
    name: {
      type: Sequelize.STRING,
      allownull: false
    },
    hostname: {
      type: Sequelize.STRING,
      allownull: false
    },
    pid: {
      type: Sequelize.INTEGER,
      allownull: false
    },
    connected: {
      type: Sequelize.BOOLEAN,
      allownull: false,
      defaultValue: false
    }
  })
}
