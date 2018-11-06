'use strict'

const logger = require('./components/logger')
const mongodb = require('./components/mongo')
const common  = require('./components/common')
const server = require('./components/jwt')


module.exports = Object.assign({}, logger, mongodb, common, server)