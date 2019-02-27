'use strict'
var request = require('supertest')
var url
var instance
require('./insertDemoInDB')
var ponte = require('ponte')
process.env = {
  PROCESS_TYPE: 'direct-mongo',
  DB_URL: 'mongodb://localhost:27017',
  APP_NAME: 'Paraffin Broker',
  ALLOW_INSECURE_HTTP: true,
  ALLOW_INSECURE_MQTT: true,
  ALLOW_INSECURE_COAP: true,
  DB_PONTE_NAME: 'mongodb://localhost:27017/ponte',
  DB_AUTH_URL: 'mongodb://localhost:27017/',
  DB_AUTH_NAME: 'paraffin',
  DB_AUTH_COLLECTION: 'auth',
  MQTT_PORT: 1883,
  HTTP_PORT: 3000,
  COAP_PORT: 2345,
  AUTHENTICATION_TYPE: 'direct-mongo',
  REQUEST_TIMEOUT: 3000,
  LOG_LEVEL: 'info',
  LOGGER_ENABLE: true
}
const config = require('../config')

var AuthIOK = require('./direct-mongo')

var envAuth = {}

var auth = new AuthIOK(envAuth)

var ponteSettings = {
  logger: {
    level: config('LOG_LEVEL'),
    name: config('APP_NAME')
  },
  http: {
    port: config('HTTP_PORT'),
    authenticate: auth.authenticateHTTP(),
    authorizeGet: auth.authorizeGetHTTP(),
    authorizePut: auth.authorizePutHTTP()
  },
  mqtt: {
    port: config('MQTT_PORT'), // tcp
    authenticate: auth.authenticateMQTT(),
    authorizePublish: auth.authorizePublishMQTT(),
    authorizeSubscribe: auth.authorizeSubscribeMQTT()
  },
  coap: {
    port: config('COAP_PORT'), // udp
    authenticate: auth.authenticateHTTP(),
    authorizeGet: auth.authorizeGetHTTP(),
    authorizePut: auth.authorizePutHTTP()
  },
  persistence: {
    // same as http://mcollina.github.io/mosca/docs/lib/persistence/mongo.js.html
    type: 'mongo',
    url: config('DB_PONTE_NAME')
  },
  broker: {
    // same as https://github.com/mcollina/ascoltatori#mongodb
    type: 'mongo',
    url: config('DB_PONTE_NAME')
  }
}

describe('Broker HTTP Test', () => {
  url = 'localhost:' + process.env.HTTP_PORT.toString()

  before(function (done) {
    instance = ponte(ponteSettings, done)
  })

  after(function (done) {
    instance.close(done)
  })

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
      .auth('username', 'password')
      .send('hello mahdi')
      .expect(204, done)
  })

  it('should GET an Authorized access and return 200', function (done) {
    request(url)
      .get('/resources/mahdi/hello')
      .auth('username', 'password')
      .set('Accept', 'application/json')
      .expect(200, 'hello mahdi', done)
  })

  it('should POST and GET a topic and its payload', function (done) {
    request(url)
      .post('/resources/hello')
      .auth('username', 'password')
      .set('content-type', 'text/plain')
      .send('hello world')
      .expect(204, function () {
        request(url)
          .get('/resources/hello')
          .auth('username', 'password')
          .expect(200, 'hello world', done)
      })
  })
})
