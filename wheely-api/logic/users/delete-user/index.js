const { validate, errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User } } = require('wheely-data')

module.exports = function(adminId, id) {
  validate.string(adminId)
  validate.string.notVoid('adminId', adminId)
  if (!ObjectId.isValid(adminId)) throw new ContentError(`${adminId} is not a valid id`)

  validate.string(id)
  validate.string.notVoid('id', id)
  if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

  return (async () => {
    // checks if admin is an admin
    let admin = await User.findOne({ _id: adminId, role: 'admin' })
    if (!admin) throw new NotFoundError(`user with id ${adminId} not found`)

    // checks if the user to delete exists
    const user = await User.findById(id)
    if (!user) throw new NotFoundError(`user with id ${id} not found`)

    // delete user
    await User.findByIdAndDelete(id)
  })()
}
