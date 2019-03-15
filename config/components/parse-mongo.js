'use strict'

const joi = require('joi')

const envVarsSchema = joi
  .object({
    DB_PONTE_NAME: joi.string().regex(/^mongodb:\/\//).required(),
    API_SERVER_URL: joi.string().default('http://localhost:1337/parse'),
    APP_ID: joi.string().default('APP_ID'),
    JAVASCRIPT_KEY: joi.string().default('JAVASCRIPT_KEY'),
    MASTER_KEY: joi.string().default('MASTER_KEY')
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
  JAVASCRIPT_KEY: env.JAVASCRIPT_KEY,
  MASTER_KEY: env.MASTER_KEY,
  APP_ID: env.APP_ID,
  API_SERVER_URL: env.API_SERVER_URL
}
