const { validate, errors: { CredentialsError } } = require('wheely-utils')
const { models: { User } } = require('wheely-data')

module.exports = function(email, password) {
  validate.string(email)
  validate.string.notVoid('email', email)
  validate.string(password)
  validate.string.notVoid('password', password)

  return (async () => {
    // checks if user exists
    const user = await User.findOne({ email, password })
    if (!user) throw new CredentialsError('wrong credentials')

    // update lastAccess
    user.lastAccess = new Date
    await user.save()
    return user.id
  })()
}
