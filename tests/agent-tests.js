'use strict'

import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import agentFixtures from './fixtures/agent'

const config = {
  logging: function () {

  }
}

const MetricStub = {
  belongsTo: sinon.spy()
}

let id = 1
let single = Object.assign({}, agentFixtures.single)
let AgentStub = null
let db = null
let sandbox = null
let uuid = 'yyy-yyy-yyy'

let uuidArgs = {
    where: {
        uuid
    }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create stub

  // Model findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // model findById stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../index.js', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the model')

  t.true(MetricStub.belongsTo.called, 'MetricModel.hasMany was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the model')
})

test.serial('Agent#findById', async t => {
    let agent = await db.Agent.findById(id)

    t.true(AgentStub.findById.called, 'findById should be called on model')
    t.true(AgentStub.findById.calledOnce, 'findById should be called once')
    t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

    t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#createOrUpdate', async t => {
    let agent = await db.Agent.createOrUpdate(single)

    t.true(AgentStub.findOne.called, 'findOne should be called on model')
    t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
    t.true(AgentStub.update.calledOnce, 'update should be called once')

    t.deepEqual(agent, single, 'Agent should be the same')
})
