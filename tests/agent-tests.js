'use strict'

import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import agentFixtures from './fixtures/agent'

let AgentStub = null
let db = null
let sandbox = null

const config = {
  logging: function () {}
}

const MetricStub = {
  belongsTo: sinon.spy()
}

const id = 1
const single = Object.assign({}, agentFixtures.single)
const uuid = 'yyy-yyy-yyy'

const username = {
  where: { username: 'platzi', connected: true }
}

const connectedArgs = {
  where: { connected: true }
}

const uuidArgs = {
  where: {
    uuid
  }
}

const newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: '0',
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model findAll stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(username).returns(Promise.resolve(agentFixtures.platzi))

  // Model findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs.uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

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
  const agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})


test.serial('Agent#findConnected', async t => {
    const agents = await db.agent.findConnected()
    
    t.true(AgentStub.findAll.called, 'findAll should be called on model')
    t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
    t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with spacific ')
    
    t.is(agents.length, agentFixtures.connected.length, 'agent should be ')
    t.deepEqual(agents, agentFixtures.connected, 'agent should be the same')
})

test.serial('Agent#findAll', async t => {
    let agents = await db.agent.findAll()
    
    t.true(AgentStub.findAll.called, 'findAll should be calle on model')
    t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
    t.true(AgentStub.findOne.calledWith(), 'findAll should be called without')
    
    t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
    t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findByUsername', async t => {
    const agents = await db.Agent.findByUsername('platzi')
    
    t.true(AgentStub.findAll.called, 'findAll should be called on model')
    t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
    t.true(AgentStub.findAll.calledWith(username), 'findAll should be called with spacific ')
    
    t.is(agents.length, agentFixtures.platzi.length, 'agents should be the same')
    t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
})

test.serial('Agent#createOrUpdate - exist', async t => {
    const agent = await db.Agent.createOrUpdate(single)
  
    t.true(AgentStub.findOne.called, 'findOne should be called on model')
    t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
    t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')
    
    t.true(AgentStub.update.called, 'create should be called model')
    t.true(AgentStub.update.calledOnce, 'create should be called once')
    t.true(AgentStub.update.calledWith(single), 'create should be called with uuid args')
  
    t.deepEqual(agent, single, 'Agent should be the same')
  })

test.serial('Agent#createOrUpdate - new', async t => {
  const agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.update.calledOnce, 'update should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne should be called with uuid args')

  t.true(AgentStub.create.called, 'create should be called model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specific argument')

  t.deepEqual(agent, newAgent, 'Agent should be the same')
})