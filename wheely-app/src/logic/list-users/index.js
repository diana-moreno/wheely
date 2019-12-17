import call from '../../utils/call'
const { validate, errors: { NotFoundError, CredentialsError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, id) {
  validate.string(token)
  validate.string.notVoid('token', token)

  if (id) {
    validate.string(id)
    validate.string.notVoid('id', id)
  }

  return (async () => {
    const defaultEndpoint = `${API_URL}/users`
    const superEndpoint = `${API_URL}/users/${id}/users`
    const endpoint = id ? superEndpoint : defaultEndpoint
    const res = await call(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (res.status === 200) {
      const users = JSON.parse(res.body)
      return users
    }
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
