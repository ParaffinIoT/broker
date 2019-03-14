'use strict'

// In a node.js environment
var Parse = require('parse/node')

// const joi = require('joi')
const config = require('../config')

function AuthIOK (authSettings) {
  console.log('authentication function is running...')
  Parse.initialize(
    config('APP_ID'),
    config('JAVASCRIPT_KEY'),
    config('MASTER_KEY')
  )
  // javascriptKey is required only if you have it on server.

  Parse.serverURL = config('API_SERVER_URL')
}

function findClient (data, callback) {
  console.log('>findClient is Starting')
  console.log(data)
  var Client = Parse.Object.extend(data.name)
  console.log(Client)
  var query = new Parse.Query(Client)
  query.equalTo('clientId', data.id)
  query
    .find()
    .then(results => {
      // results is an array of parse.object.
      console.log('find result:' + results.length)
      console.log(JSON.stringify(results))
      let objectParse = {
        name: results[0].get('name'),
        clientId: results[0].get('clientId'),
        secret: results[0].get('secret'),
        adapter: results[0].get('adapter'),
        topics: results[0].get('topics')
      }
      return callback(objectParse)
    })
    .catch(error => {
      // error is an instance of parse.error.
      console.log('Failed to find, with error code: ' + error.message)
      return callback(error)
    })
}

function reviewClient (data) {
  var error
  return new Promise(resolve => {
    console.log('reviewClient is Starting')
    findClient(data, function (callback) {
      let checkResult =
        callback &&
        callback.adapter &&
        callback.secret &&
        callback.secret.type &&
        callback.secret.pwdhash &&
        callback.name &&
        callback.topics

      if (!checkResult) {
        error = {
          error: 'Request scheme is undifined.',
          code: '503'
        }
        console.log('Error from reviewClient')
        console.log('Request scheme is undifined.')
        resolve(error)
      }

      if ('error' in callback) {
        console.log('Error: ' + callback.error)
        resolve(error)
      }

      var hashedpassword
      if (callback.secret.type.toString() === 'openid') {
        console.log('Passoword is OpenID')
        hashedpassword = data.token
      }

      if (
        callback.name === data.name &&
        callback.secret.pwdhash === hashedpassword
      ) {
        callback.paraffinAuth = true
        console.log('Auth is Ok!')
        console.log(callback)
        resolve(callback)
      } else {
        error = {
          error: 'Name or Password is wrong.',
          code: '503'
        }
        console.log('Name or Password is wrong.')
        resolve(error)
      }
    })
  })
}

/*
  Used when the device is sending credentials.
  mqtt.username must correspond to the device username in the Auth connection
  if mqtt.username is JWT, mqtt.password is hte JWT itself
  mqtt.password must correspond to the device password
*/
AuthIOK.prototype.authenticateMQTT = function () {
  console.log('authenticate with Credentials request!')
  return async function (client, username, password, callback) {
    var data = {
      id: client.id, // {client-name}
      name: username,
      token: password.toString(),
      type: 'mqtt',
      grant_type: 'password',
      scope: 'openid profile'
    }

    let objectParse = await reviewClient(data)

    if ('error' in objectParse) {
      console.log('Error: ' + objectParse.error)
      return callback(objectParse, false)
    }

    if (
      objectParse.adapter.indexOf('mqtt') < 0 &&
      objectParse.adapter.indexOf('*') < 0
    ) {
      console.log('MQTT is not permitted')
      var error = {
        error: 'mqtt is not permitted',
        code: '503'
      }
      return callback(error, false)
    }

    var hashedpassword
    if (objectParse.secret.type.toString() === 'openid') {
      hashedpassword = password.toString()
    }

    if (objectParse.name === 'JWT') {
      //      self.authenticationJWT(client, callback)
      console.log('JWT is not setuped')
    } else if (
      objectParse.name === username &&
      objectParse.secret.pwdhash === hashedpassword
    ) {
      client.deviceProfile = objectParse // profile attached to the client object
      console.log(client.deviceProfile)
      return callback(null, true)
    } else {
      console.log('Name or Password is wrong.')
      return callback(null, false)
    }
  }
}

AuthIOK.prototype.authorizePublishMQTT = function () {
  return function (client, topic, payload, callback) {
    // var isOwner = topic.indexOf(client.deviceProfile.name) == 0 || topic.indexOf(client.deviceProfile.clientId) == 0
    var isValid =
      client.deviceProfile &&
      client.deviceProfile.topics &&
      client.deviceProfile.topics.indexOf(topic) > -1
    if (!isValid) console.log('Publish MQTT is not authorized')
    callback(null, isValid)
  }
}

AuthIOK.prototype.authorizeSubscribeMQTT = function () {
  return function (client, topic, callback) {
    // var isOwner = topic.indexOf(client.deviceProfile.name) == 0 || topic.indexOf(client.deviceProfile.clientId) == 0
    var isValid =
      client.deviceProfile &&
      client.deviceProfile.topics &&
      client.deviceProfile.topics.indexOf(topic) > -1
    if (!isValid) console.log('Subscribe MQTT is not authorized')
    callback(null, isValid)
  }
}

/**
 * @param {Object} req The incoming message @link https://github.com/mcollina/node-coap#incoming
 * @param {Function} callback The callback function. Has the following structure: callback(error, authenticated, subject)
 */
AuthIOK.prototype.authenticateHTTP = function () {
  // var self = this

  return async function (req, callback) {
    console.log(req.headers)

    var url = req.url
    var tenantId = url.split('/')[2]
    var clientId = req.headers['x-paraffin-client-id']
    console.log('Tenant Id: ' + tenantId)
    console.log('Client Id: ' + clientId)

    var checkReq = req && req.url && req.headers && req.headers.authorization
    if (!checkReq) {
      console.log('Request scheme is undifined.')
      return callback(null, false)
    }

    if (req.headers.authorization.startsWith('Basic')) {
      console.log('HTTP Request is in Basic Authentication')

      // grab the encoded value
      var encoded = req.headers.authorization.split(' ')[1]
      // decode it using base64
      var decoded = Buffer.from(encoded, 'base64').toString()
      var name = decoded.split(':')[0]
      var password = decoded.split(':')[1]
      console.log(name + ' and ' + password)
      // check if the passed username and password match with the values in database.
      // this is dummy validation.

      var data = {
        id: clientId, // {client-name}
        name: name,
        token: password,
        type: 'http',
        grant_type: 'password',
        scope: 'openid profile'
      }

      let objectParse = await reviewClient(data)

      if (
        objectParse.adapter.indexOf('http') < 0 &&
        objectParse.adapter.indexOf('*') < 0
      ) {
        console.log('HTTP is not permitted')
        let error = {
          error: 'http is not permitted',
          code: '503'
        }
        return callback(error, false)
      }

      if (objectParse && objectParse.paraffinAuth) {
        req.deviceProfile = objectParse // profile attached to the client object
        return callback(null, true, req)
      } else {
        console.log('Name or Password is wrong.')
        return callback(null, false)
      }
    }
  }
}

// Examples:
//   Error:             callback(error)
//   Authenticated:     callback(null, true, { username: 'someone' })
//   Not authenticated: callback(null, false)

/**
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Function} callback The callback function. Has the following structure: callback(error, authorized)
 */

AuthIOK.prototype.authorizeGetHTTP = function () {
  return function (subject, topic, callback) {
    console.log('******Authorize Get Http*********')
    // var isOwner = topic.indexOf(subject.deviceProfile.name) == 0 || topic.indexOf(subject.deviceProfile.clientId) == 0
    var isValid =
      subject.deviceProfile &&
      subject.deviceProfile.topics &&
      subject.deviceProfile.topics.indexOf(topic) > -1
    if (!isValid) console.log('Get request is not permitted')
    callback(null, isValid)
  }
  // Examples:
  //   Error:          callback(error)
  //   Authorized:     callback(null, true)
  //   Not authorized: callback(null, false)
}
/**
 * @param {Object} subject The subject returned by the authenticate function
 * @param {string} topic The topic
 * @param {Buffer} payload The payload
 * @param {Function} callback The callback function. Has the following structure: callback(error, authorized)
 */
AuthIOK.prototype.authorizePutHTTP = function () {
  return function (subject, topic, payload, callback) {
    // var isOwner = topic.indexOf(subject.deviceProfile.name) == 0 || topic.indexOf(subject.deviceProfile.clientId) == 0
    var isValid =
      subject.deviceProfile &&
      subject.deviceProfile.topics &&
      subject.deviceProfile.topics.indexOf(topic) > -1
    if (!isValid) console.log('PUT request is not permitted')
    callback(null, isValid)
  }
  // Examples:
  //   Error:          callback(error)
  //   Authorized:     callback(null, true)
  //   Not authorized: callback(null, false)
}

module.exports = AuthIOK
