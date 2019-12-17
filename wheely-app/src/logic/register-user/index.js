import call from '../../utils/call'
const { validate, errors: { ConflictError } } = require('wheely-utils')
const API_URL = process.env.REACT_APP_API_URL

export default function(token, name, surname, email, dni, password, role) {
  validate.string(name)
  validate.string.notVoid('name', name)
  validate.string(surname)
  validate.string.notVoid('surname', surname)
  validate.string(email)
  validate.string.notVoid('e-mail', email)
  validate.email(email)
  validate.string(password)
  validate.string.notVoid('password', password)
  validate.string(role)
  validate.string.notVoid('role', role)

  return (async () => {
    const res = await call(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, surname, email, dni, password, role })
    })

    if (res.status === 201) return 'Registration succesfully'
    if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)
    throw new Error(JSON.parse(res.body).message)
  })()
}
