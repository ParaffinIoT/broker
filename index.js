'use strict'

var ponte = require('ponte')
const config = require('./config')

try {
    var AuthIOK = require(`./lib/auth-${process.env.PROCESS_TYPE}`)
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    throw new Error(`No config for process type ${process.env.PROCESS_TYPE}`)
  }
  throw error
}


var envAuth = {
    appId: config('APP_ID'),
    restapiKey: config('REST_API_KEY'),
    javascriptKey: config('JAVASCRIPT_KEY'),
    masterKey: config('MASTER_KEY'),
    apiserverURL: config('API_SERVER_URL'),
    timeout: config('REQUEST_TIMEOUT'),
    authType: config('AUTHENTICATION_TYPE'),
    jwtSecret: config('JWT_SECRET')
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
        type: "mongo",
        url: config('DB_URL')
    },
    broker: {
        // same as https://github.com/mcollina/ascoltatori#mongodb
        type: "mongo",
        url: config('DB_URL')
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

server.on("updated", function (resource, buffer) {
    console.log("Resource Updated", resource, buffer)
})

server.on('ready', setup)

// fired when the server is ready
function setup() {
    console.log('Brokero is up and running')
}