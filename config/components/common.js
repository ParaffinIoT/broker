'use strict'
const joi = require('joi')

const envVarsSchema = joi
  .object({
    MQTT_PORT: joi.number().integer().min(1).max(65535).required().default(1883),
    HTTP_PORT: joi.number().integer().min(1).max(65535).required().default(3000),
    COAP_PORT: joi.number().integer().min(1).max(65535).required().default(5683),
    APP_NAME: joi.string().default('Paraffin Broker'),
    API_SERVER_URL: joi.string().default('http://localhost:1337/parse'),
    APP_ID: joi.string().default('APP_ID'),
    JAVASCRIPT_KEY: joi.string().default('JAVASCRIPT_KEY'),
    MASTER_KEY: joi.string().default('MASTER_KEY'),
    AUTHENTICATION_TYPE: joi.string().required().default('parseserver'),
    ALLOW_INSECURE_MQTT: joi.boolean().default(true),
    ALLOW_INSECURE_HTTP: joi.boolean().default(true),
    ALLOW_INSECURE_COAP: joi.boolean().default(true),
    REQUEST_TIMEOUT: joi.number().integer().min(1).max(10000).required().default(5000)
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
  APP_NAME: env.APP_NAME,
  API_SERVER_URL: env.API_SERVER_URL,
  APP_ID: env.APP_ID,
  JAVASCRIPT_KEY: env.JAVASCRIPT_KEY,
  MASTER_KEY: env.MASTER_KEY,
  ALLOW_INSECURE_HTTP: env.ALLOW_INSECURE_HTTP,
  ALLOW_INSECURE_MQTT: env.ALLOW_INSECURE_MQTT,
  ALLOW_INSECURE_COAP: env.ALLOW_INSECURE_COAP,
  REQUEST_TIMEOUT: env.REQUEST_TIMEOUT,
  AUTHENTICATION_TYPE: env.AUTHENTICATION_TYPE
}
