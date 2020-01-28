'use strict'

const agent = {
    id: 1,
    uuid: 'yyy-yyy-yyy',
    name: 'fixture',
    username: 'marce',
    hostname: 'test-host',
    pid: 0, 
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
}

const agents = [ 
    agent,
    extend(agent, { id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test'}),
    extend(agent, { id: 3, uuid: 'yyy-yyy-yyx'}),
    extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test'}),
    extend(agent, { id: 5, uuid: 'yyy-yyy-frlulis', connected: true,username: 'frulis'})
]

function extend (obj, values) {
    const clone = Object.assign({}, obj)
    return Object.assign(clone, values)
}

module.exports = {
    single: agent,
    all: agents,
    connected: agents.find(a => a.connected),
    platzi: agents.find(a => a.username === 'platzi'),
    byUuid: id => agents.find(a => a.uuid === id), // shift() retorna primer elemento 
    byId: id => agents.find(a => a.id === id),
    username: agents.find(a => a.username === 'frulis')
}