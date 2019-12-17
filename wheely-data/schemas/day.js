const { Schema, ObjectId } = require('mongoose')

module.exports = new Schema({
  index: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6]
  },
  hours: {
    type: [String]
  }
})
