/*

'use strict'

const {
  expect
} = require('chai')

describe('Testing  Envs', () => {
  const componentpath = './testing'

  before(() => {
    process.env = {
      APP_NAME: 'Paraffin Broker',
      ALLOW_INSECURE_HTTP: true,
      ALLOW_INSECURE_MQTT: true,
      ALLOW_INSECURE_COAP: true,
      DB_PONTE_NAME: 'mongodb://localhost:27017/ponte',
      MQTT_PORT: 1883,
      HTTP_PORT: 3000,
      COAP_PORT: 2345,
      REQUEST_TIMEOUT: 3000,
      LOG_LEVEL: 'info',
      LOGGER_ENABLE: true,
      API_SERVER_URL: 'http://localhost:1337/parse',
      APP_ID: 'APP_ID',
      JAVASCRIPT_KEY: 'JAVASCRIPT_KEY',
      MASTER_KEY: 'MASTER_KEY'
    }
  })

  it('should return all envs needed for testing', () => {
    expect(require(componentpath)).to.have.all.keys([
      'APP_NAME',
      'ALLOW_INSECURE_HTTP',
      'ALLOW_INSECURE_MQTT',
      'ALLOW_INSECURE_COAP',
      'DB_PONTE_NAME',
      'MQTT_PORT',
      'HTTP_PORT',
      'COAP_PORT',
      'REQUEST_TIMEOUT',
      'LOG_LEVEL',
      'LOGGER_ENABLE',
      'API_SERVER_URL',
      'APP_ID',
      'JAVASCRIPT_KEY',
      'MASTER_KEY'
    ])
  })
})

*/