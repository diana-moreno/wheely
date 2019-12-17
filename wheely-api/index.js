require('dotenv').config()

const express = require('express')
const { name, version } = require('./package.json')
const { argv: [, , port], env: { PORT = port || 8080, DB_URL } } = process
const cors = require('cors')
const { database } = require('wheely-data')
const { users, practices,schedule } = require('./routes')

const api = express()

api.use(cors())
api.use('/users', users)
api.use('/practices', practices)
api.use('/schedule', schedule)

database
  .connect(DB_URL)
  .then(() => api.listen(PORT, () => console.log(`${name} ${version} up and running on port ${PORT}`)))
