import call from '../../utils/call'
const { validate, errors: { CredentialsError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(email, password) {
  validate.string(email)
  validate.string.notVoid('email', email)
  validate.string(password)
  validate.string.notVoid('password', password)

  return (async () => {
    const res = await call(`${API_URL}/users/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (res.status === 200) return JSON.parse(res.body).token
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
