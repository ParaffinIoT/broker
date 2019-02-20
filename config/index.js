'use strict'
let config

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

if (process.env.NODE_ENV === 'development') require('dotenv').config()

if (!process.env.AUTHENTICATION_TYPE) throw new Error('PROCESS_TYPE must be set')

console.log(`%%%%%%config for process type ${process.env.AUTHENTICATION_TYPE}`)

try {
  config = require(`./${process.env.AUTHENTICATION_TYPE}`)
  console.log(config)
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    throw new Error(`No config for process type ${process.env.AUTHENTICATION_TYPE}`)
  }
  throw error
}

module.exports = env => {
  if (config[env] === undefined) throw new Error(`No config for env variable ${env}`)
  return config[env]
}