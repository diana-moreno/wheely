const { validate, errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { Practice } } = require('wheely-data')

module.exports = function(id) {
  validate.string(id)
  validate.string.notVoid('id', id)
  if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

  return (async () => {
    const practice = await Practice
      .findById(id)
      .populate('instructorId')
      .populate('studentId')

    if (!practice) throw new NotFoundError(`practice with id ${id} not found`)
    return practice.toObject()
  })()
}
