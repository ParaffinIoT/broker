'use strict'

const joi = require('joi')

const envVarsSchema = joi
  .object({
    DB_PONTE_NAME: joi.string().regex(/^mongodb:\/\//).required(),
    DB_AUTH_URL: joi.string().regex(/^mongodb:\/\//).required(),
    DB_AUTH_COLLECTION: joi.string().default('authBroker')
  })
  .unknown()

const {
  error,
  value: env
} = joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
  DB_PONTE_NAME: env.DB_PONTE_NAME,
  DB_AUTH_URL: env.DB_AUTH_URL,
  DB_AUTH_COLLECTION: env.DB_AUTH_COLLECTION
}
