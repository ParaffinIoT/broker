'use strict'
const { expect } = require('chai')

describe('Logger Component', () => {
  const componentPath = './logger'

  beforeEach(() => {
    process.env = {
      LOG_LEVEL: 'info',
      LOGGER_ENABLE: true
    }
  })

  it('should return logger envs', () => {
    expect(require(componentPath)).to.have.keys([
      'LOG_LEVEL',
      'LOGGER_ENABLE'
    ])
  })
})
