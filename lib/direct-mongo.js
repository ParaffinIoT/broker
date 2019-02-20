'use strict'
const config = require('../config')
var debug = require('debug')('Paraffin')
var jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// Ponte Database Name
//const db_ponte_name = config('DB_PONTE_NAME')


// Authentication Database URL and Name
const db_auth_url = config('DB_AUTH_URL')
const db_auth_name = config('DB_AUTH_NAME')

// Database Collection
const db_auth_collection_name = config('DB_AUTH_COLLECTION')


function AuthIOK(authSettings) {
    console.log('authentication function is running...')
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
            let checkResult = result && result.adapter && result.secret && result.secret.type && result.secret.pwdhash && result.name && result.topics
            if (!checkResult) {
                console.log("Request scheme is undifined.")
                return callback("Request scheme is undefined", false)
            }

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

            if (result.name == 'JWT') {
                self.authenticationJWT(client, callback)

            } else if (result.name == username && result.secret.pwdhash == hashedpassword) {
                client.deviceProfile = result //profile attached to the client object
                console.log(client.deviceProfile)
                return callback(null, true)
            } else {
                console.log("Name or Password is wrong.")
                return callback("Credintial is wrong", false)
            }

        })

    }
}


AuthIOK.prototype.authorizePublishMQTT = function () {
    return function (client, topic, payload, callback) {
        //var isOwner = topic.indexOf(client.deviceProfile.name) == 0 || topic.indexOf(client.deviceProfile.clientId) == 0
        var isValid = client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1
        if (!isValid) console.log('Publish MQTT is not authorized')
        callback(null, isValid)
    }
}

AuthIOK.prototype.authorizeSubscribeMQTT = function () {
    return function (client, topic, callback) {
        //var isOwner = topic.indexOf(client.deviceProfile.name) == 0 || topic.indexOf(client.deviceProfile.clientId) == 0
        var isValid = client.deviceProfile && client.deviceProfile.topics && client.deviceProfile.topics.indexOf(topic) > -1
        if (!isValid) console.log('Subscribe MQTT is not authorized')
        callback(null, isValid)
    }
}

/**
 * @param {Object} req The incoming message @link https://github.com/mcollina/node-coap#incoming
 * @param {Function} callback The callback function. Has the following structure: callback(error, authenticated, subject)
 */
AuthIOK.prototype.authenticateHTTP = function () {
    var self = this

    return function (req, callback) {
        var url = req.url
        var tenantId = url.split('/')[2]
        //console.log('Tenant Id: ' + tenantId)

        var checkReq = req && req.url && req.headers && req.headers.authorization
        if (!checkReq) {
            console.log("Request scheme is undifined.")
            return callback("Request scheme is undefined", false)
        }

        if (req.headers.authorization.startsWith('Basic')) {
            console.log('HTTP Request is in Basic Authentication')

            //grab the encoded value
            var encoded = req.headers.authorization.split(' ')[1];
            // decode it using base64
            var decoded = new Buffer(encoded, 'base64').toString();
            var name = decoded.split(':')[0];
            var password = decoded.split(':')[1];
            // check if the passed username and password match with the values in database.
            // this is dummy validation. 

            var data = {
                id: tenantId, // {client-name}
                name: name,
                token: password,
                type: 'http',
                grant_type: 'password',
                scope: 'openid profile'
            }

            if (data.name == 'JWT') {
                self.authenticationJWT(data, callback)

            } else {

                self.findClient(data, function (result) {
                    let checkResult = result && result.adapter && result.secret && result.secret.type && result.secret.pwdhash && result.name && result.topics
                    if (!checkResult) {
                        console.log("Request scheme is undifined.")
                        return callback("Request scheme is undefined", false)
                    }

                    if ('error' in result) {
                        console.log('Error: ' + result.error)
                        return callback(result, false)
                    }

                    if (result.adapter.indexOf('http') < 0 && result.adapter.indexOf('*') < 0) {
                        console.log('HTTP is not permitted')
                        var error = {
                            error: 'http is not permitted',
                            code: '503'
                        }
                        return callback(error, false)
                    }

                    var hashedpassword
                    if (result.secret.type.toString() === 'openid') {
                        hashedpassword = password.toString()
                    }

                    if (result.name == name && result.secret.pwdhash == hashedpassword) {
                        req.deviceProfile = result //profile attached to the client object
                        return callback(null, true, req)
                    } else {
                        console.log("Name or Password is wrong.")
                        return callback("Credintial is wrong", false)
                    }
                })
            }

        }
        /*else if(req.headers.authorization.startsWith('Bearer')) {
            console.log('HTTP Request is in JWT Authentication')

            //grab the encoded value
            var encoded = req.headers.authorization.split(' ')[1];

            var data = {
                id: tenantId, // {client-name}
                name: 'JWT',
                token: encoded,
                type: 'http',
                grant_type: 'JWT'
            }

            if (data.name == 'JWT') {
                self.authenticationJWT(data, callback)
            }   
        }*/
        else {
            console.log("Unauthorized request.")
            return callback("Unauthorized request", false)
        }
    }
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
        //var isOwner = topic.indexOf(subject.deviceProfile.name) == 0 || topic.indexOf(subject.deviceProfile.clientId) == 0
        var isValid = subject.deviceProfile && subject.deviceProfile.topics && subject.deviceProfile.topics.indexOf(topic) > -1
        if (!isValid) console.log('Get request is not permitted')
        callback(null, isValid)
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
        //var isOwner = topic.indexOf(subject.deviceProfile.name) == 0 || topic.indexOf(subject.deviceProfile.clientId) == 0
        var isValid = subject.deviceProfile && subject.deviceProfile.topics && subject.deviceProfile.topics.indexOf(topic) > -1
        if (!isValid) console.log('PUT request is not permitted')
        callback(null, isValid)
    }
    // Examples:
    //   Error:          callback(error);
    //   Authorized:     callback(null, true);
    //   Not authorized: callback(null, false);
}

AuthIOK.prototype.authenticationJWT = function (data, callback) {

    if (data.username !== 'JWT') {
        return callback("Invalid Credentials", false)
    }

    jwt.verify(data.password, new Buffer(self.clientSecret, 'base64'), function (err, profile) {
        if (err) {
            return callback("Error getting UserInfo", false)
        }
        console.log("Authenticated client " + profile.user_id)
        console.log(profile.topics)
        data.deviceProfile = profile
        return callback(null, data)
    })
}


AuthIOK.prototype.findClient = function (data, callback) {
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
            cb(doc)
        })
    }
    // Use connect method to connect to the server
    MongoClient.connect(db_auth_url, function (err, client) {
        if (err) {
            console.log('Mongodb error: ' + err)
            var error = {
                error: err,
                code: '503'
            }
            return cb(error)
        }
        assert.equal(null, err)
        const db = client.db(db_auth_name)
        findDocument(db, function (cb) {
            client.close()
            return callback(cb)
        })
    })
}


module.exports = AuthIOK