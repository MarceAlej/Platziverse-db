'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const defaults = require('defaults')
const setupAgent = require('./lib/agent')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const Sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  Sequelize.authenticate()

  if (config.setup) {
    await Sequelize.sync({ force: true })
  }

  const Agent = setupAgent(AgentModel)
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
