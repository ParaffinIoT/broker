'use strict'

const logger = require('./components/logger')
const mongo = require('./components/mongo')
const common = require('./components/common')

module.exports = Object.assign({}, logger, mongo, common)
