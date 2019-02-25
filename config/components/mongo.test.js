'use strict'
const { expect } = require('chai')

describe('MongoDb Component Test', () => {
  const componentPath = './mongo'

  it('should throw error if mongodb url is invalid', () => {
    delete process.env.DB_URL
    process.env.DB_URL = 'localhost:3000'
    expect(() => require(componentPath)).to.throws('Config validation error:')
  })

  it('should return mongodb url as env', () => {
    process.env = {
      DB_URL: 'mongodb://localhost:2707',
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
