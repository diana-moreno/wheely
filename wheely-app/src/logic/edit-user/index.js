import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError, ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, userId, name, surname, email, dni, credits, password) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(userId)
  validate.string.notVoid('user id', userId)

  if (name) {
    validate.string(name)
    validate.string.notVoid('name', name)
  }
  if (surname) {
    validate.string(surname)
    validate.string.notVoid('surname', surname)
  }
  if (email) {
    validate.string(email)
    validate.string.notVoid('email', email)
  }
  if (dni) {
    validate.string(dni)
    validate.string.notVoid('dni', dni)
  }
  if (credits) {
    validate.number(credits)
  }
  if (password) {
    validate.string(password)
    validate.string.notVoid('password', password)
  }

  return (async () => {
    const res = await call(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, surname, email, dni, credits, password })
    })

    if (res.status === 200) return
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
