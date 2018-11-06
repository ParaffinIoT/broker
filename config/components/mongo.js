'use strict'

const joi = require('joi')

const envVarsSchema = joi
  .object({
    DB_URL: joi.string().regex(/^mongodb:\/\//).required(),
    DB_PONTE_NAME: joi.string().required(),
    DB_AUTH_NAME: joi.string().required(),
    DB_AUTH_COLLECTION: joi.string().required(),
    DB_COLLECTION_PREFIX: joi.string().required()
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
  DB_URL: env.DB_URL,
  DB_PONTE_NAME: env.DB_PONTE_NAME,
  DB_AUTH_NAME: env.DB_AUTH_NAME,
  DB_AUTH_COLLECTION: env.DB_AUTH_COLLECTION,
  DB_COLLECTION_PREFIX: env.DB_COLLECTION_PREFIX
}