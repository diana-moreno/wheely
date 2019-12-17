import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError, ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, instructorId, indexDay, hour) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(instructorId)
  validate.string.notVoid('instructorId', instructorId)

  validate.number(indexDay)

  validate.string(hour)
  validate.string.notVoid('hour', hour)

  return (async () => {
    const res = await call(`${API_URL}/schedule/${instructorId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ indexDay, hour })
    })

    if (res.status === 200) {
      const instructor = JSON.parse(res.body)
      return instructor
    }
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
