'use strict'

const joi = require('joi')

const envVarsSchema = joi
  .object({
    DB_URL: joi.string().regex(/^mongodb:\/\//).required(),
    DB_PONTE_NAME: joi.string().regex(/^mongodb:\/\//).required(),
    DB_AUTH_NAME: joi.string().required(),
    DB_AUTH_URL: joi.string().required(),
    DB_AUTH_COLLECTION: joi.string().required(),
    JAVASCRIPT_KEY: joi.string().required(),
    MASTER_KEY: joi.string().required(),
    CLIENT_KEY: joi.string().required(),
    REST_API_KEY: joi.string().required(),
    DOTNET_KEY: joi.string().required(),
    FILE_KEY: joi.string().required(),
    APP_ID: joi.string().required(),
    // PUBLIC_SERVER_URL: joi.string().uri().required(),
    API_SERVER_URL: joi.string().required()
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
  DB_AUTH_URL: env.DB_AUTH_URL,
  DB_AUTH_COLLECTION: env.DB_AUTH_COLLECTION,
  JAVASCRIPT_KEY: env.JAVASCRIPT_KEY,
  MASTER_KEY: env.MASTER_KEY,
  CLIENT_KEY: env.CLIENT_KEY,
  REST_API_KEY: env.REST_API_KEY,
  DOTNET_KEY: env.DOTNET_KEY,
  FILE_KEY: env.FILE_KEY,
  APP_NAME: env.APP_NAME,
  // PUBLIC_SERVER_URL: env.PUBLIC_SERVER_URL,
  APP_ID: env.APP_ID,
  API_SERVER_URL: env.API_SERVER_URL
}
