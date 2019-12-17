const { validate, errors: { ConflictError, NotFoundError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User, Student, Instructor, Week, Day } } = require('wheely-data')

module.exports = function(adminId, name, surname, email, dni, password, role) {
  validate.string(adminId)
  validate.string.notVoid('adminId', adminId)
  if (!ObjectId.isValid(adminId)) throw new ContentError(`${adminId} is not a valid id`)
  validate.string(name)
  validate.string.notVoid('name', name)
  validate.string(surname)
  validate.string.notVoid('surname', surname)
  validate.string(email)
  validate.string.notVoid('e-mail', email)
  validate.email(email)
  validate.string(dni)
  validate.string.notVoid('dni', dni)
  validate.string(password)
  validate.string.notVoid('password', password)
  validate.string(role)
  validate.string.notVoid('role', role)

  return (async () => {
    // checks if admin is an admin
    let admin = await User.findOne({ _id: adminId, role: 'admin' })
    if (!admin) throw new NotFoundError(`user with id ${adminId} not found or has no permission`)

    // checks if user already exists
    let user = await User.findOne({ email })
    if(user) throw new ConflictError(`user with email ${email} already exists`)
    user = await User.findOne({ dni })
    if(user) throw new ConflictError(`user with dni ${dni} already exists`)

    // create new user depending on the role
    user = await User.create({ name, surname, email, dni, password, role })

    // create specific profile for instructor
    let instructor = await User.findOne({ _id: ObjectId(user.id), role: 'instructor' })

    if (instructor) {
      instructor.profile = new Instructor()
      instructor = await User.findOneAndUpdate({ _id: ObjectId(instructor.id) }, { $set: instructor })
      instructor.profile.schedule = new Week()

      for (let i = 0; i < 7; i++) {
        instructor.profile.schedule.days.push(new Day({ index: i, hours: [] }))
      }
      await User.updateOne({ _id: ObjectId(instructor.id) }, { $set: instructor })
    }

    // create specific profile for student
    let student = await User.findOne({ _id: ObjectId(user.id), role: 'student' })

    if (student) {
      student.profile = new Student()
      await User.updateOne({ _id: ObjectId(student.id) }, { $set: student })
    }
  })()
}
