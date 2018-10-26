'use strict'

//Thanks Eugenio Pace for auth0mosca repository in "https://github.com/eugeniop/auth0mosca"

var request = require('request')
var jwt = require('jsonwebtoken')

/*
  apiserverURL is your api server URL, e.g. https://localhost:1337/api/
  clientId, identifies your app with AuthIOK
  jwtSecret, is used to sign the JWT (and validate it when using JWT mode)
*/
function AuthIOK(authSettings) {
    console.log('authentication setting is Starting...')
    this.apiserverURL = authSettings.apiserverURL
    this.restapiKey = authSettings.restapiKey
    this.appId = authSettings.appId
    this.masterKey = authSettings.masterKey
    this.connection = authSettings.connection
    this.clientId = authSettings.clientId
    this.jwtSecret = authSettings.jwtSecret
    this.authType = authSettings.authType
    this.timeout = authSettings.timeout
}


/*
  Used when the device is sending credentials. 
  mqtt.username must correspond to the device username in the Auth connection
  if mqtt.username is JWT, mqtt.password is hte JWT itself
  mqtt.password must correspond to the device password
*/
AuthIOK.prototype.authenticateMQTT = function () {
    var self = this
    console.log('authenticate with Credentials request...')
    return function (client, username, password, callback) {
        if (username == 'JWT' || self.authType == 'jwt') {
            self.authenticationJWT(r.id_token, self.jwtSecret, client.deviceProfile)
            jwt.verify(r.id_token, new Buffer(self.jwtSecret, 'base64'), function (err, profile) {
                if (err) {
                    return callback("Error getting UserInfo", false)
                }
                client.deviceProfile = profile //profile attached to the client object
                return callback(null, true)
            })
        }

    }
}

AuthIOK.prototype.authorizePublishMQTT = function () {
    return function (client, topic, payload, callback) {
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
    return function (req, callback) {
        //console.log(req)
        var authorization = req.headers.authorization
        var token = authorization.split(/\s+/).pop() || ''
        console.log('authorization is: ' + authorization)
        console.log('token is ' + token)
        var authentication = (new Buffer(token, 'base64')).toString('utf8')
        console.log('Authentication HTTP is: ' + authentication)

        if (username == 'JWT' || self.authType == 'jwt') {
            self.authenticationJWT(r.id_token, self.jwtSecret, client.deviceProfile)
            jwt.verify(r.id_token, new Buffer(self.jwtSecret, 'base64'), function (err, profile) {
                if (err) {
                    return callback("Error getting UserInfo", false)
                }
                client.deviceProfile = profile //profile attached to the client object
                return callback(null, true)
            })

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



module.exports = AuthIOK