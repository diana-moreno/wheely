const { Router } = require('express')
const { registerUser, authenticateUser, retrieveUser, deleteUser, editUser, listUsers, addCredits } = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const bodyParser = require('body-parser')
const { errors: { NotFoundError, ConflictError, CredentialsError } } = require('wheely-utils')

const jsonBodyParser = bodyParser.json()
const router = Router()

router.post('/', tokenVerifier, jsonBodyParser, (req, res) => {
  try {
  const { id, body: { name, surname, email, dni, password, role } } = req

    registerUser(id, name, surname, email, dni, password, role)
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

router.post('/auth', jsonBodyParser, (req, res) => {
  try {
  const { body: { email, password } } = req

    authenticateUser(email, password)
      .then(id => {
        const token = jwt.sign({ sub: id }, SECRET, { expiresIn: '1d' })
        res.json({ token })
      })
      .catch(error => {
        const { message } = error

        if (error instanceof CredentialsError)
          return res.status(401).json({ message })

        res.status(500).json({ message })
      })
  } catch ({ message }) {
    res.status(400).json({ message })
  }
})

router.get('/:id', tokenVerifier, (req, res) => {
  try {
    const { params: { id } } = req

    retrieveUser(id)
      .then(user => res.json({ user }))
      .catch(error => {
        const { message } = error

        if (error instanceof NotFoundError)
          return res.status(404).json({ message })

        res.status(500).json({ message })
      })
  } catch (error) {
    const { message } = error

    res.status(400).json({ message })
  }
})

router.get('/:id/users', tokenVerifier, (req, res) => {
  // if is admin, can retrieve users of user 'id'
  // if is not admin, only can retrieve user with id 'id'
  const { params: { id }, id: ownerId } = req

  try {
    retrieveUser(ownerId)
      .then(checkIfAdminAndContinue)
      .catch(catchError)
  } catch ({ message }) {
    res.status(400).json({ message })
  }

  function catchError({ message }) {
    if (error instanceof NotFoundError)
      return res.status(404).json({ message })
    return res.status(500).json({ message })
  }

  function checkIfAdminAndContinue(user){
    if (user.role === 'admin') {
      return retrieveUser(id)
        .then(checkIfInstrAndContinue)
        .catch(catchError)
    } else res.status(403)
  }

  function checkIfInstrAndContinue(user){
    if (user.role === 'instructor') {
      return listUsers(id)
        .then(users => res.json({ users }))
        .catch(catchError)
    } else res.status(403)
  }
})


router.delete('/:userId', tokenVerifier, (req, res) => {
  try {
    const { id, params: { userId } } = req

    deleteUser(id, userId)
      .then(() => res.end())
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

router.patch('/:userId', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
    const { id, params: { userId }, body: { name, surname, email, dni, credits, password } } = req

    editUser(id, userId, name, surname, email, dni, credits, password)
      .then(() => res.end() )
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

router.get('/', tokenVerifier, (req, res) => {
  try {
    const { id } = req

    listUsers(id)
      .then(users => res.json({ users }))
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

router.put('/credits', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
    const { id, body: { studentId, credits} } = req

    addCredits(id, studentId, credits)
      .then(() => res.end() )
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

router.get('/progression', jsonBodyParser, tokenVerifier, (req, res) => {
  try {
  const { id, body: { query } } = req

    retrieveProgression(id, query)
      .then(users => res.json({ users }))
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
