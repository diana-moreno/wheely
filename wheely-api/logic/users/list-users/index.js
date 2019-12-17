const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Practice, Instructor } } = require('wheely-data')

module.exports = function(id) {
  validate.string(id)
  validate.string.notVoid('id', id)
  if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

  return (async () => {
    let student = await User.findOne({ _id: id, role: 'student' })
    let instructor = await User.findOne({ _id: id, role: 'instructor' })
    let admin = await User.findOne({ _id: id, role: 'admin' })

    if (!student && !instructor && !admin) {
      throw new NotFoundError(`user with id ${id} not found`)
    }

    let users

    // the result returned depends on the user who is demanding (permission control)
    if (admin) {
      users = await User
        .find({ "role": { $in: ['student', 'instructor'] } })
        .lean()
    } else if (instructor) {
      const practices = await Practice
        .find({ "instructorId": ObjectId(id), "feedback": undefined }, { "studentId": 1 })
        .populate('studentId')
        .lean()

      users = practices.reduce((users, practice) => {
        const user = practice.studentId
        if (!users.find(({ _id }) => _id === user._id)) {
          users.push(user)
        }
        return users
      }, [])

    } else if(student) {
      users = await User
        .find({ "role": 'instructor' })
        .lean()
    }
    return users
  })()
}
