const { Router } = require('express')
const { toggleSchedule } = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const bodyParser = require('body-parser')
const { errors: { NotFoundError, ConflictError, CredentialsError } } = require('wheely-utils')

const jsonBodyParser = bodyParser.json()
const router = Router()

router.patch('/:instructorId', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
    const { id, params: { instructorId}, body: { indexDay, hour } } = req

    toggleSchedule(id, instructorId, indexDay, hour)
      .then((instructor) => res.json({ instructor }))
      .catch(error => {
        const { message } = error

        if (error instanceof NotFoundError)
          return res.status(404).json({ message })
        if (error instanceof ConflictError)
          return res.status(409).json({ message })

        res.status(500).json({ message })
      })
  } catch ({ message }) {
    res.status(400).json({ message })
  }
})

module.exports = router
