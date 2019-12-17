const { Schema, ObjectId } = require('mongoose')
const User = require('./user')

module.exports = new Schema({
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 1
  },
  instructorId: { // quitar los id
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  studentId: { // quitar los id
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  feedback: {
    type: String,
    default: undefined
  },
  valoration: {
    type: String,
    enum: ['bad', 'regular', 'good']
  },
})
