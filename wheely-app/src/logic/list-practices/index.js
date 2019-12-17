import call from '../../utils/call'
const { validate, errors: { NotFoundError, CredentialsError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, id) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(id)
  validate.string.notVoid('id', id)

  return (async () => {
    const res = await call(`${API_URL}/practices/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (res.status === 200) {
      const practices = JSON.parse(res.body)
      return practices
    }

    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
