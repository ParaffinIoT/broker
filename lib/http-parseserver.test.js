'use strict'
require('./parseserverRunning')
var request = require('supertest')

var url

process.env = {
  PROCESS_TYPE: 'parse-server',
  APP_NAME: 'Paraffin Broker',
  DB_URL: 'mongodb://localhost:27017/paraffin',
  DB_PONTE_NAME: 'mongodb://localhost:27017/ponte',
  MQTT_PORT: 2883,
  HTTP_PORT: 3000,
  COAP_PORT: 2345,
  AUTHENTICATION_TYPE: 'parse-server',
  REQUEST_TIMEOUT: 3000,
  JAVASCRIPT_KEY: 'JAVASCRIPT_KEY',
  MASTER_KEY: 'MASTER_KEY',
  LOG_LEVEL: 'info',
  API_SERVER_URL: 'http://localhost:1337/parse',
  PARSE_MOUNT: 'parse',
  APP_ID: 'APP_ID',
  PORT: 1337,
  LOGGER_ENABLE: true
}

var ponte = require('ponte')
// require('./insertParseDemoInDB')
var AuthIOK = require(`./parse-server`)

var envAuth = {}

var auth = new AuthIOK(envAuth)

var ponteSettings = {
  logger: {
    level: process.env.LOG_LEVEL,
    name: process.env.APP_NAME
  },
  http: {
    port: process.env.HTTP_PORT,
    authenticate: auth.authenticateHTTP(),
    authorizeGet: auth.authorizeGetHTTP(),
    authorizePut: auth.authorizePutHTTP()
  },
  mqtt: {
    port: process.env.MQTT_PORT, // tcp
    authenticate: auth.authenticateMQTT(),
    authorizePublish: auth.authorizePublishMQTT(),
    authorizeSubscribe: auth.authorizeSubscribeMQTT()
  },
  coap: {
    port: process.env.COAP_PORT, // udp
    authenticate: auth.authenticateHTTP(),
    authorizeGet: auth.authorizeGetHTTP(),
    authorizePut: auth.authorizePutHTTP()
  },
  persistence: {
    // same as http://mcollina.github.io/mosca/docs/lib/persistence/mongo.js.html
    type: 'mongo',
    url: process.env.DB_PONTE_NAME
  },
  broker: {
    // same as https://github.com/mcollina/ascoltatori#mongodb
    type: 'mongo',
    url: process.env.DB_PONTE_NAME
  }
}

ponte(ponteSettings)

describe('Broker HTTP Test', () => {
  url = 'localhost:' + process.env.HTTP_PORT.toString()

  it('should return 401 if a request cannot be authenticated', function (done) {
    request(url)
      .get('/resources/notauthenticated')
      .expect(401, done)
  })

  it('should GET an unauthorized access and return 401', function (done) {
    request(url)
      .get('/resources/hello')
      .expect(401, done)
  })

  it('should PUT an unauthorized access and return 401', function (done) {
    request(url)
      .put('/resources/hello')
      .send('hello world')
      .expect(401, done)
  })

  it('should PUT an authorized access and return 204', function (done) {
    request(url)
      .put('/resources/mahdi/hello')
      .auth('mahdi', 'adrekni')
      .set('X-Paraffin-Client-Id', 'm313')
      .send('hello mahdi')
      .expect(204, done)
  })

  it('should GET an Authorized access and return 200', function (done) {
    request(url)
      .get('/resources/mahdi/hello')
      .auth('mahdi', 'adrekni')
      .set('X-Paraffin-Client-Id', 'm313')
      .expect(200, 'hello mahdi', done)
  })

  it('should POST and GET a topic and its payload', function (done) {
    request(url)
      .put('/resources/hello')
      .auth('username', 'password')
      .set('content-type', 'text/plain')
      .set('X-Paraffin-Client-Id', 'u911')
      .send('hello world')
      .expect(204, function () {
        request(url)
          .get('/resources/hello')
          .auth('username', 'password')
          .set('X-Paraffin-Client-Id', 'u911')
          .expect(200, 'hello world', done)
      })
  })
})
