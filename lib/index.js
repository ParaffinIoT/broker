var ponte = require('ponte');
var AuthIOK = require('./auth');

///--- Globals

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

if (!process.env.MQTT_PORT) {
    console.log('MQTT_PORT not specified, falling back to 1883.');
}

if (!process.env.HTTP_PORT) {
    console.log('HTTP_PORT not specified, falling back to 3000.');
}

if (!process.env.COAP_PORT) {
    console.log('COAP_PORT not specified, falling back to 5683.');
}

var envParaffin = {
    databaseURI: databaseUri || 'mongodb://localhost:27017/broker',
    mqttPort: process.env.MQTT_PORT || 1883,
    httpPort: process.env.HTTP_PORT || 3000,
    coapPort: process.env.COAP_PORT || 5683,
    appId: process.env.APP_ID || 'APP_ID',
    restapiKey: process.env.REST_API_KEY || 'REST_KEY',
    javascriptKey: process.env.JAVASCRIPT_KEY || 'JAVASCRIPT_KEY',
    masterKey: process.env.MASTER_KEY || 'MASTER_KEY', //Add your master key here. Keep it secret!
    apiserverURL: process.env.API_SERVER_URL || 'http://localhost:1337/api', // Don't forget to change to https if needed
}

var envAuth = {
    appId: envParaffin.appId,
    restapiKey: envParaffin.restapiKey,
    masterKey: envParaffin.masterKey,
    //apiserverURL: envParaffin.apiserverURL,
    authNamespace: 'http://localhost:1337/api',
    timeout: 5000,
    jwt: false,

};

var auth = new AuthIOK(envAuth);

var ponteSettings = {
    logger: {
        level: 'info'
    },
    http: {
        port: envParaffin.httpPort // tcp
    },
    mqtt: {
        port: envParaffin.mqttPort, // tcp
        authenticate: auth.authenticate(),
        authorizePublish: auth.authorizePublish(),
        authorizeSubscribe: auth.authorizeSubscribe()
    },
    coap: {
        port: envParaffin.coapPort // udp
    },
    persistence: {
        // same as http://mcollina.github.io/mosca/docs/lib/persistence/mongo.js.html
        type: "mongo",
        url: envParaffin.databaseURI
    },
    broker: {
        // same as https://github.com/mcollina/ascoltatori#mongodb
        type: "mongo",
        url: envParaffin.databaseURI
    }
};


var server = ponte(ponteSettings);

server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function (packet, client) {
    console.log('Published', packet.payload);
});

server.on("updated", function (resource, buffer) {
    console.log("Resource Updated", resource, buffer);
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
    console.log('Ponte server is up and running');
}