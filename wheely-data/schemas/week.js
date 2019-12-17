const { Schema, ObjectId } = require('mongoose')
const Day = require('./day')

module.exports = new Schema({
  days: [Day]
})
