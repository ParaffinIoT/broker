'use strict'

const logger = require('./components/logger')
const parse = require('./components/parse-mongo')
const common = require('./components/common')

module.exports = Object.assign({}, logger, parse, common)
