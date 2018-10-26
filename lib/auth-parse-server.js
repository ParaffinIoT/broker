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
    console.log('authentication setting is starting...')
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
        //console.log('#######')
        //console.log(client)
        //console.log('************')
        var data = {
            id: client.id, // {client-name}
            name: username,
            token: password.toString(),
            type: 'mqtt',
            connection: self.connection,
            grant_type: "password",
            scope: 'openid profile'
        }

        self.request(data, function (result) {
            console.log('Result cb')
            console.log(result)

            if ('error' in result) {
                console.log('Error: ' + result.error)
                return callback(result, false)
            }

            if ('authorized' in result && 'profile' in result) {
                if (result.authorized) {
                    client.deviceProfile = result.profile //profile attached to the client object
                    return callback(null, true)
                }
            }

            console.log("API Server Response Scheme is undifined.")
            return callback("Response scheme is undefined", false)
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
                    if (e) {
                        console.log("Authentication server connection Error.")
                        console.log(e)
                        return callback(e, false)
                    }

                    if(r.statusCode != 200) {
                        console.log('Response status code is error')
                        return callback('Response status code is error', false)
                    }
                    
                    var res = JSON.parse(b)
                    var result = res.result

                    if ('error' in result) {
                        console.log('Error: ' + result.error)
                        return callback(result, false)
                    }

                    if ('authorized' in result && 'profile' in result) {
                        if (result.authorized) {
                            client.deviceProfile = result.profile //profile attached to the client object
                            return callback(null, true)
                        }
                    } else {
                        console.log("Client does not authenticate")
                        return callback("Client is Unknown", false)
                    }

                    console.log("API Server Response Scheme is undifined.")
                })
                */
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

        var data = {
            client_id: client.id, // {client-name}
            username: username,
            password: password.toString(),
            connection: self.connection,
            grant_type: "password",
            scope: 'openid profile'
        }

        request.get({
            headers: {
                "Content-type": "application/json",
                "X-Parse-Application-Id": self.appId,
                //"X-Parse-REST-API-Key": self.restapiKey,
                "X-Parse-Master-Key": self.masterKey
            },
            url: self.apiserverURL + '/classes/Device' + '?where={"clientid":"' + data.client_id + '"}',
            timeout: self.timeout,
            //body: JSON.stringify(data)
        }, function (e, r, b) {
            if (e) {
                console.log("Authentication server connection Error.")
                console.log(e)
                return callback(e, false)
            }
            var r = JSON.parse(b)

            if (r.error) {
                return callback(r, false)
            }

            if ('results' in r && 'username' in r.results[0]) {
                if (r.results[0].username == username && r.results[0].password == password.toString()) {
                    client.deviceProfile = r.results[0].deviceProfile //profile attached to the client object
                    return callback(null, true)
                }
            } else {
                console.log("API Server Response Scheme is undifined.")
            }

            console.log("Client does NOT Authenticate")
            return callback("Client is Unknown", false)

        })
    }

    callback(null, true, {
        username: 'someone'
    })
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


AuthIOK.prototype.request = function (data, callback) {
    //return function (data, callback) {
    var self = this
    console.log('request goes....')
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
}


module.exports = AuthIOK