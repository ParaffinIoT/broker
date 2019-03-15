'use strict'
const { expect } = require('chai')

describe('Common Component Test', () => {
  const componentPath = './common'

  beforeEach(() => {
    process.env = {
      MQTT_PORT: 1883,
      HTTP_PORT: 3000,
      COAP_PORT: 5683,
      APP_NAME: 'Paraffin Broker',
      AUTHENTICATION_TYPE: 'parseserver',
      ALLOW_INSECURE_MQTT: true,
      ALLOW_INSECURE_HTTP: true,
      ALLOW_INSECURE_COAP: true,
      REQUEST_TIMEOUT: 5000
    }
  })

  it('should return process envs for common component', () => {
    expect(require(componentPath)).to.have.keys([
      'MQTT_PORT',
      'HTTP_PORT',
      'COAP_PORT',
      'APP_NAME',
      'AUTHENTICATION_TYPE',
      'ALLOW_INSECURE_MQTT',
      'ALLOW_INSECURE_HTTP',
      'ALLOW_INSECURE_COAP',
      'REQUEST_TIMEOUT'
    ])
  })
})
