'use strict'

const logger = require('./components/logger')
const mongodb = require('./components/mongo')
const common = require('./components/common')

module.exports = Object.assign({}, logger, mongodb, common)
