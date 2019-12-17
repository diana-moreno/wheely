const { Schema } = require('mongoose')
const { validators: { isEmail } } = require('wheely-utils')

module.exports = new Schema({
  credits: {
    type: Number,
    default: 0,
    required: true,
  }
})
