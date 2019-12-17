const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Practice, Instructor } } = require('wheely-data')
const moment = require('moment')

module.exports = function(instructorId, studentId, practiceId, feedback, valoration) {
  // sincronous validate
  validate.string(instructorId)
  validate.string.notVoid('instructorId', instructorId)
  if (!ObjectId.isValid(instructorId)) throw new ContentError(`${instructorId} is not a valid id`)

  validate.string(studentId)
  validate.string.notVoid('studentId', studentId)
  if (!ObjectId.isValid(studentId)) throw new ContentError(`${studentId} is not a valid id`)

  validate.string(practiceId)
  validate.string.notVoid('practiceId', practiceId)
  if (!ObjectId.isValid(practiceId)) throw new ContentError(`${practiceId} is not a valid id`)

  validate.string(feedback)
  validate.string.notVoid('feedback', feedback)
  validate.string(valoration)
  validate.string.notVoid('valoration', valoration)

  return (async () => {
    // check if student exists
    let student = await User.findOne({ _id: studentId, role: 'student' })
    if (!student) throw new NotFoundError(`user with id ${studentId} not found`)

    // check if instructor exists
    let instructor = await User.findOne({ _id: instructorId, role: 'instructor' })
    if (!instructor) throw new NotFoundError(`user with id ${instructorId} not found`)

    // check if the practice exists and matches with student and instructor
    let practice = await Practice.findOne({ _id: practiceId, studentId: studentId, instructorId: instructorId })
    if (!practice) throw new ConflictError(`practice with id ${practiceId} does not exists`)

    // check if the practice is in the past
    if(moment(practice.date).isAfter(moment())) {
      throw new ConflictError(`practice with id ${practiceId} is already in the future`)
    }

    // check if the practice has already feedback and valoration
    if(practice.feedback || practice.valoration) {
      throw new ConflictError(`practice with id ${practiceId} has been already valorated`)
    }

    //update practice with new feedback and valoration and update status
    await Practice.updateOne({ _id: practiceId }, { $set: { 'feedback': feedback, 'valoration': valoration } }, { multi: true })

  })()
}
