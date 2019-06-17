'use strict'
const joi = require('joi')

const envVarsSchema = joi
  .object({
    MQTT_PORT: joi.number().integer().min(1).max(65535).required().default(1883),
    HTTP_PORT: joi.number().integer().min(1).max(65535).required().default(3000),
    COAP_PORT: joi.number().integer().min(1).max(65535).required().default(5683),
    APP_NAME: joi.string().default('Paraffin Broker')
  })
  .unknown()

const { error, value: env } = joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

module.exports = {
  MQTT_PORT: env.MQTT_PORT,
  HTTP_PORT: env.HTTP_PORT,
  COAP_PORT: env.COAP_PORT,
  APP_NAME: env.APP_NAME
}
