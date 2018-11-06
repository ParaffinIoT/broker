'use strict'
const config = require('../config')

var debug = require('debug')('Paraffin')

var request = require('request')
var jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// Connection URL
const db_url = config('DB_URL')
// Ponte Database Name
const db_ponte_name = config('DB_PONTE_NAME')
// Authentication Database Name
const db_auth_name = config('DB_AUTH_NAME')
// Database Collection
const db_auth_collection = config('DB_AUTH_COLLECTION')
const db_prefix_collection = config('DB_COLLECTION_PREFIX')
const db_auth_collection_name = db_prefix_collection + db_auth_collection



function AuthIOK(authSettings) {
    console.log('authentication setting is starting...')
    this.connecttion = 'mqtt'
}


/*
  Used when the device is sending credentials.
  mqtt.username must correspond to the device username in the Auth connection
  if mqtt.username is JWT, mqtt.password is hte JWT itself
  mqtt.password must correspond to the device password
*/
AuthIOK.prototype.authenticateMQTT = function () {
    var self = this
    console.log('authenticate with Credentials request!')
    return function (client, username, password, callback) {

        var data = {
            id: client.id, // {client-name}
            name: username,
            token: password.toString(),
            type: 'mqtt',
            grant_type: 'password',
            scope: 'openid profile'
        }


        self.findClient(data, function (result) {
            console.log('###Result cb')
            console.log(result)

            if ('error' in result) {
                console.log('Error: ' + result.error)
                return callback(result, false)
            }

            if (result.adapter.indexOf('mqtt') < 0 && result.adapter.indexOf('*') < 0) {
                console.log('MQTT is not permitted')
                var error = {
                    error: 'mqtt is not permitted',
                    code: '503'
                }
                return callback(error, false)
            }

            var hashedpassword
            if (result.secret.type.toString() === 'openid') {
                hashedpassword = password.toString()
            }

            if (result.name == username && result.secret.pwdhash == hashedpassword) {
                client.deviceProfile = result //profile attached to the client object
                return callback(null, true)
            }

            console.log("API Server Response Scheme is undifined.")
            return callback("Response scheme is undefined", false)
        })

    }
}


AuthIOK.prototype.authorizePublishMQTT = function () {
    return function (client, topic, payload, callback) {
        console.log('Topic is: ' + topic)
        console.log(client.deviceProfile.topics.indexOf(topic))
        callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1)
    }
}

AuthIOK.prototype.authorizeSubscribeMQTT = function () {
    return function (client, topic, callback) {
        callback(null, client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1)
    }
}

/**
 * @param {Object} req The incoming message @link https://github.com/mcollina/node-coap#incoming
 * @param {Function} callback The callback function. Has the following structure: callback(error, authenticated, subject)
 */
AuthIOK.prototype.authenticateHTTP = function () {

}

// Examples:
//   Error:             callback(error);
//   Authenticated:     callback(null, true, { username: 'someone' });
//   Not authenticated: callback(null, false);

/**
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Function} callback The callback function. Has the following structure: callback(error, authorized)
 */

AuthIOK.prototype.authorizeGetHTTP = function () {
    return function (subject, topic, callback) {
        console.log(subject)
        console.log(topic)
        callback(null, true)
    }
    // Examples:
    //   Error:          callback(error);
    //   Authorized:     callback(null, true);
    //   Not authorized: callback(null, false);
}
/**
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Buffer} payload The payload
 * @param {Function} callback The callback function. Has the following structure: callback(error, authorized)
 */
AuthIOK.prototype.authorizePutHTTP = function () {
    return function (subject, topic, payload, callback) {
        console.log(subject)
        console.log(topic)
        callback(null, true)
    }
    // Examples:
    //   Error:          callback(error);
    //   Authorized:     callback(null, true);
    //   Not authorized: callback(null, false);
}

AuthIOK.prototype.authenticationJWT = function () {

}

AuthIOK.prototype.authenticate = function () {

}

AuthIOK.prototype.findClient = function (data, callback) {
    var self = this
    console.log('request goes....')

    const findDocument = function (db, cb) {
        // Get the documents collection
        const collection = db.collection(db_auth_collection_name)
        // Find some documents
        collection.findOne({
            clientId: data.id
        }, function (err, doc) {
            if (err) {
                console.log('Mongodb error: ' + err)
                var error = {
                    error: err,
                    code: '503'
                }
                return cb(error)
            }
            assert.equal(err, null)
            console.log("Found the following records")
            //console.log(doc)
            //console.log('Doc find')
            cb(doc)
        })
    }


    // Use connect method to connect to the server
    MongoClient.connect(db_url, function (err, client) {
        if (err) {
            console.log('Mongodb error: ' + err)
            var error = {
                error: err,
                code: '503'
            }
            return cb(error)
        }
        assert.equal(null, err)

        console.log("Connected successfully to server")
        const db = client.db(db_auth_name)
        findDocument(db, function (cb) {
            client.close()
            //console.log('###fininsh find')
            //console.log(cb)
            return callback(cb)
        })
    })



    /*
        request.post({
            headers: {
                "Content-type": "application/json",
                "X-Parse-Application-Id": self.appId,
                "X-Parse-REST-API-Key": self.restapiKey,
                "X-Parse-Master-Key": self.masterKey
            },
            url: self.apiserverURL + '/functions/auth',
            timeout: self.timeout,
            body: JSON.stringify(data)
        }, function (e, r, b) {
            var err

            if (e) {
                console.log("Authentication server connection Error.")
                console.log(e)
                err = {
                    error: 'error in http request',
                    code: '503'
                }
                return callback(err)
            }

            if (r.statusCode != 200) {
                console.log('Response status code is error')
                err = {
                    error: 'Response status code is error',
                    code: '503'
                }
                return callback(err)
            }

            var res = JSON.parse(b)
            if ('result' in res) {
                var result = res.result
                return callback(result)
            }

            err = {
                error: 'Response error',
                code: '503'
            }
            return callback(err)
        })

        */
}


module.exports = AuthIOK