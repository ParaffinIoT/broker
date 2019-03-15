'use strict'

var express = require('express')
var ParseServer = require('parse-server').ParseServer
var app = express()

var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/paraffin', // Connection string for your MongoDB database
  appId: 'APP_ID',
  masterKey: 'MASTER_KEY', // Keep this key secret!
  javascriptKey: 'JAVASCRIPT_KEY',
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
})
// Serve the Parse API on the /parse URL prefix
app.use('/parse', api)
app.listen(1337, function () {
  console.log('parse-server-test running on port 1337.')
  require('./insertParseDemoInDB')
})
