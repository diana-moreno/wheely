import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError, ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, userId) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(userId)
  validate.string.notVoid('user id', userId)

  return (async () => {
    const res = await call(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (res.status === 200) return
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message) // cuando???
  })()
}
