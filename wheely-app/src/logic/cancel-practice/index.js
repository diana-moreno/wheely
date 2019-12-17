import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError, ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, instructorId, practiceId) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(instructorId)
  validate.string.notVoid('user id', instructorId)

  validate.string(practiceId)
  validate.string.notVoid('practice id', practiceId)

  return (async () => {
    const res = await call(`${API_URL}/practices/${practiceId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instructorId })
    })

    if (res.status === 201) return
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
