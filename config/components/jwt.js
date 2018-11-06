'use strict'
const joi = require('joi')

const envVarsSchema = joi
  .object({
    JWT_SECRET: joi.string().required()
  })
  .unknown()

const { error, value: env } = joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
  JWT_SECRET: env.JWT_SECRET
}
