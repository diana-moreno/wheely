import call from '../../utils/call'
const { validate, errors: { CredentialsError, NotFoundError, ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, practiceId, studentId, comment, valoration) {
  validate.string(token)
  validate.string.notVoid('token', token)

  validate.string(practiceId)
  validate.string.notVoid('practice id', practiceId)

  validate.string(studentId)
  validate.string.notVoid('student id', studentId)

  validate.string(comment)
  validate.string.notVoid('comment', comment)

  validate.string(valoration)
  validate.string.notVoid('valoration', valoration)

  return (async () => {
    const res = await call(`${API_URL}/practices/feedback/${practiceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId, comment, valoration })
    })

    if (res.status === 201) return
    if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
    if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
