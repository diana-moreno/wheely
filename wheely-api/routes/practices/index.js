const { Router } = require('express')
const { createPractice, cancelPractice, listPractices, updatePractices, writeFeedback, retrievePractice } = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const bodyParser = require('body-parser')
const { errors: { NotFoundError, ConflictError, CredentialsError } } = require('wheely-utils')

const jsonBodyParser = bodyParser.json()
const router = Router()


router.post('/', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
  const { id, body: { instructorId, dateTime } } = req

    createPractice(instructorId, id, dateTime)
      .then((practice) => res.json({ practice }))
      .catch(error => {
        const { message } = error

        if (error instanceof ConflictError)
          return res.status(409).json({ message })

        res.status(500).json({ message })
      })
  } catch ({ message }) {
    res.status(400).json({ message })
  }
})

router.delete('/:id', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
  const { id, params: { id: practiceId }, body: { instructorId } } = req

    cancelPractice(instructorId, id, practiceId)
      .then(() => res.status(201).end())
      .catch(error => {
        const { message } = error

        if (error instanceof ConflictError)
          return res.status(409).json({ message })

        res.status(500).json({ message })
      })
  } catch ({ message }) {
    res.status(400).json({ message })
  }
})

router.get('/:id', tokenVerifier, jsonBodyParser, (req, res) => {
  try {
  const { params: { id } } = req

    listPractices(id)
      .then(practices => res.json({ practices }))
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

router.get('/detail/:id', tokenVerifier, jsonBodyParser, (req, res) => {
  try {
  const { params: { id } } = req

    retrievePractice(id)
      .then(practice => res.json({ practice }))
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

router.put('/feedback/:practiceId', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
    const { id, params: { practiceId }, body: { studentId, comment, valoration } } = req

    writeFeedback(id, studentId, practiceId, comment, valoration)
      .then(() => res.status(201).end())
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