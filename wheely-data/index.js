const { connect, disconnect } = require('mongoose')
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const { ObjectId } = require('mongodb')

module.exports = {
  database: {
    connect(url) {
      return connect(url, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    },
    disconnect
  },
  models: require('./models'),
  ObjectId
}
