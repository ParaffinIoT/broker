'use strict'

var ponte = require('ponte')
const config = require('./config')

var AuthIOK = require('./lib/direct-mongo')

var envAuth = {

}

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

var server = ponte(ponteSettings)

server.on('clientConnected', function (client) {
  console.log('Client connected', client.id)
})

// fired when a message is received
server.on('published', function (packet, client) {
  console.log('Published', packet.payload)
})

server.on('updated', function (resource, buffer) {
  console.log('Resource Updated', resource, buffer)
})

server.on('ready', setup)

// fired when the server is ready
function setup () {
  console.log('Brokero is up and running')
}
