'use strict'
const joi = require('joi')

const envVarsSchema = joi
  .object({
    APP_NAME: joi.string().default('Brokero'),
    APP_ID: joi.string().required(),
    JAVASCRIPT_KEY: joi.string().required(),
    MASTER_KEY: joi.string().required(),
    REST_API_KEY: joi.string().required(),
    PUBLIC_SERVER_URL: joi.string().uri().required(),
    AUTHENTICATION_TYPE: joi.string().required(),
    API_SERVER_URL: joi.string().required()
  })
  .unknown()

const { error, value: env } = joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
  APP_NAME: env.APP_NAME,
  APP_ID: env.APP_ID,
  JAVASCRIPT_KEY: env.JAVASCRIPT_KEY,
  MASTER_KEY: env.MASTER_KEY,
  REST_API_KEY: env.REST_API_KEY,
  PUBLIC_SERVER_URL: env.PUBLIC_SERVER_URL,
  API_SERVER_URL: env.API_SERVER_URL
}
