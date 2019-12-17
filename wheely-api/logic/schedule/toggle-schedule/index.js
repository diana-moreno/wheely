const { validate, errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Day, Week } } = require('wheely-data')

module.exports = function(adminId, instructorId, indexDay, hour) {
  // sincronous validate
  validate.string(adminId)
  validate.string.notVoid('adminId', adminId)
  if (!ObjectId.isValid(adminId)) throw new ContentError(`${adminId} is not a valid id`)

  validate.string(instructorId)
  validate.string.notVoid('instructorId', instructorId)
  if (!ObjectId.isValid(instructorId)) throw new ContentError(`${instructorId} is not a valid id`)

  validate.number(indexDay)

  validate.string(hour)
  validate.string.notVoid('hour', hour)

  return (async () => {
    // check if admin exists
    let admin = await User.findOne({ _id: adminId, role: 'admin' })
    if (!admin) throw new NotFoundError(`user with id ${adminId} does not have permission`)

    // check if instructor exists
    let instructor = await User.findOne({ _id: instructorId, role: 'instructor' })
    if (!instructor) throw new NotFoundError(`user with id ${instructorId} not found`)

    //  searchs if the day exists to add in, and then checks if the hour in this day exists, if not, create it, if yes, delete it (make a toggle)
    if(0 <= indexDay && indexDay < 7) {
      let day = instructor.profile.schedule.days[indexDay]
      let indexFound = day.hours.indexOf(hour)
      indexFound < 0 ? day.hours.push(hour) : day.hours.splice(indexFound, 1)

      await User.updateOne({ _id: instructorId }, { $set: { 'profile.schedule': instructor.profile.schedule } }, { multi: true })
    } else {
      throw new ConflictError(`indexDay must be between 0 and 7`)
    }

    // retrieves the updated instructor account and returns it
    instructor = await User.findOne({ _id: instructorId, role: 'instructor' })

    return instructor
  })()
}

