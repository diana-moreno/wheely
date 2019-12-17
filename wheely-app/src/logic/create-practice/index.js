import call from '../../utils/call'
const { validate, errors: { NotFoundError, CredentialsError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, instructorId, dateTime) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(instructorId)
  validate.string.notVoid('instructorId', instructorId)

  return (async () => {
    const res = await call(`${API_URL}/practices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instructorId, dateTime })
    })

    if (res.status === 200) return JSON.parse(res.body).practice
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
