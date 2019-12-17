const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Practice } } = require('wheely-data')
const moment = require('moment')
const sendEmail = require('../../../helpers/send-email')

module.exports = function(instructorId, studentId, date) {
  // sincronous validate
  validate.string(instructorId)
  validate.string.notVoid('instructorId', instructorId)
  if (!ObjectId.isValid(instructorId)) throw new ContentError(`${instructorId} is not a valid id`)

  validate.string(studentId)
  validate.string.notVoid('studentId', studentId)
  if (!ObjectId.isValid(studentId)) throw new ContentError(`${studentId} is not a valid id`)


  return (async () => {

    // check if student exists
    let student = await User.findOne({ _id: ObjectId(studentId), role: 'student' })
    if (!student) throw new NotFoundError(`user with id ${studentId} not found`)

    // check if the student has credits available
    if (student.profile.credits > 0) {

      // check if instructor exists
      let instructor = await User.findOne({ _id: ObjectId(instructorId), role: 'instructor' })
      if (!instructor) throw new NotFoundError(`user with id ${instructorId} not found`)

      // check if a practice with the same instructor, date and time exists
      let existingDate = await Practice.findOne({ instructorId: instructorId, date: date })
      if (existingDate) throw new ConflictError(`practice with date ${moment(date).format('DD-MM-YYYY')} already exists`)


      // check if the practice has expired
      if (moment(date) < moment()) {
        throw new ConflictError(`practice with date ${date} has expired`)
      }

      //check if the instructor has this date and hour available in his schedule
      const hour = moment(date).format("HH:mm")
      const indexDay = moment(date).day()
      let available = false

      instructor.profile.schedule.days[indexDay].hours.forEach(hourSch => {
        hourSch === hour ? available = true : available
      })

      if (!available) {
        throw new ConflictError(`instructor has not available date ${date}`)
      }

      // create the practice
      let practice = await Practice.create({ date, instructorId, studentId })

      // update student profile with a credit less
      student.profile.credits = student.profile.credits - practice.price

      await User.updateOne({ _id: studentId }, { $set: { 'profile.credits': student.profile.credits } }, { multi: true })

      // send email to both student and instructor
      let instructorName = instructor.name.concat(' ').concat(instructor.surname)
      let studentName = student.name.concat(' ').concat(student.surname)
      let toStudent = student.email
      let toInstructor = instructor.email // instructor email
      let [dateEmail, time] = moment(date).format("YYYY-MM-DD HH:mm").split(' ')

      sendEmail(toStudent, toInstructor, dateEmail, time, instructorName, studentName)

      // returns the practice-id
      return practice.id
    } else {
      throw new ConflictError(`user has no credits`)
    }
  })()
}
