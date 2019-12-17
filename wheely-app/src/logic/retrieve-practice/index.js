import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, id) {
  validate.string(token)
  validate.string.notVoid('token', token)

  return (async () => {
    const res = await call(`${API_URL}/practices/detail/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.status === 200) {
      const practice = JSON.parse(res.body)
      return practice
    }
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
