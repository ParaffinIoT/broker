'use strict'

const {
  expect
} = require('chai')

describe('Broker Test', () => {
  const componentpath = './direct-mongo'

  before(() => {
    process.env = {
      DB_URL: 'mongodb://localhost:27017',
      APP_NAME: 'Paraffin Broker',
      ALLOW_INSECURE_HTTP: true,
      ALLOW_INSECURE_MQTT: true,
      ALLOW_INSECURE_COAP: true,
      DB_PONTE_NAME: 'mongodb://localhost:27017/ponte',
      DB_AUTH_URL: 'mongodb://localhost:27017/',
      DB_AUTH_NAME: 'paraffin',
      DB_AUTH_COLLECTION: 'auth',
      MQTT_PORT: 1883,
      HTTP_PORT: 3000,
      COAP_PORT: 2345,
      AUTHENTICATION_TYPE: 'direct-mongo',
      REQUEST_TIMEOUT: 3000,
      LOG_LEVEL: 'info',
      LOGGER_ENABLE: true
    }
  })

  it('should return all envs needed by the server', () => {
    expect(require(componentpath)).to.have.all.keys([
      'DB_URL',
      'APP_NAME',
      'ALLOW_INSECURE_HTTP',
      'ALLOW_INSECURE_MQTT',
      'ALLOW_INSECURE_COAP',
      'DB_PONTE_NAME',
      'DB_AUTH_URL',
      'DB_AUTH_NAME',
      'DB_AUTH_COLLECTION',
      'MQTT_PORT',
      'HTTP_PORT',
      'COAP_PORT',
      'AUTHENTICATION_TYPE',
      'REQUEST_TIMEOUT',
      'LOG_LEVEL',
      'LOGGER_ENABLE'
    ])
  })
})
