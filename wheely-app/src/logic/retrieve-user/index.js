import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, id) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(id)
  validate.string.notVoid('id', id)

  return (async () => {
    const res = await call(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.status === 200) {
      const user = JSON.parse(res.body)
      user.lastAccess = new Date(user.lastAccess)
      return user
    }
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
