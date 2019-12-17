const { Schema } = require('mongoose')
const { validators: { isEmail } } = require('wheely-utils')
const Week = require('./week')

module.exports = new Schema({
  schedule: {
    type: Array
  }
})
