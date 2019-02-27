'use strict'
const { expect } = require('chai')

describe('MongoDb Component Test', () => {
  const componentPath = './mongo'

  it('should return mongodb url as env', () => {
    process.env = {
      DB_URL: 'mongodb://localhost:27017',
      DB_PONTE_NAME: 'mongodb://localhost:27017/ponte',
      DB_AUTH_URL: 'mongodb://localhost:27017/',
      DB_AUTH_NAME: 'paraffin',
      DB_AUTH_COLLECTION: 'auth'
    }
    expect(require(componentPath)).have.keys([
      'DB_URL',
      'DB_PONTE_NAME',
      'DB_AUTH_URL',
      'DB_AUTH_NAME',
      'DB_AUTH_COLLECTION'
    ])
  })
})
