const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Practice, Instructor } } = require('wheely-data')

module.exports = function(userId) {
  // sincronous validate
  validate.string(userId)
  validate.string.notVoid('userId', userId)
  if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)

  return (async () => {
    //check if the user exists
    let student = await User.findOne({ _id: userId, role: 'student' })
    let instructor = await User.findOne({ _id: userId, role: 'instructor' })
    let admin = await User.findOne({ _id: userId, role: 'admin' })
    if (admin) {
      throw new ConflictError(`admin has no practices`)
    }
    if (!student && !instructor && !admin) {
      throw new NotFoundError(`user with id ${userId} not found`)
    }

    let practices

    if(student) {
      practices = await Practice
        .find({ "studentId": ObjectId(userId) })
        .populate('studentId')
        .populate('instructorId')
    } else if(instructor) {
      practices = await Practice
        .find({ "instructorId": ObjectId(userId) })
        .populate('studentId')
        .populate('instructorId')
    }
    return practices
  })()
}
