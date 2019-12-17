const { validate, errors: { ConflictError, NotFoundError, ContentError } } = require('wheely-utils')
const { ObjectId, models: { User } } = require('wheely-data')

module.exports = function(id, userId, name, surname, email, dni, credits, password) {
  validate.string(id)
  validate.string.notVoid('id', id)
  if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

  validate.string(userId)
  validate.string.notVoid('userId', userId)
  if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)

  if (name) {
    validate.string(name)
    validate.string.notVoid('name', name)
  }
  if (surname) {
    validate.string(surname)
    validate.string.notVoid('surname', surname)
  }
  if (email) {
    validate.string.notVoid('e-mail', email)
    validate.email(email)
  }
  if (dni) {
    validate.string(dni)
    validate.string.notVoid('dni', dni)
  }
  if (credits) {
    validate.number(credits)
  }
  if (password) {
    validate.string(password)
    validate.string.notVoid('password', password)
  }

  return (async () => {
    // check if user who wants to edit is an admin
    let admin = await User.findOne({ _id: id, role: 'admin' })

    // check if user who wants to edit is an instructor
    let instructor = await User.findOne({ _id: id, role: 'instructor' })
    if(instructor) {
      // check if password is correct
      instructor = await User.findOne({ _id: id, role: 'instructor', password: password })
      if (!instructor) throw new ConflictError(`password incorrect`)
    }

    // check if user who wants to edit is an student
    let student = await User.findOne({ _id: id, role: 'student' })
    if(student) {
      student = await User.findOne({ _id: id, role: 'student', password: password })
      // check if password is correct
      if (!student) throw new ConflictError(`password incorrect`)
         //edit
    }

    // check if user who wants to edit not exists
    if (!student && !admin && !instructor) throw new NotFoundError(`user with id ${userId} not found`)

    // check if user to delete exists
    let user = await User.findById(userId) // findOne with id and password
    if (!user) throw new NotFoundError(`user with id ${userId} not found`)

    //update data
    const update = {}

    name && (update.name = name)
    surname && (update.surname = surname)
    email && (update.email = email)
    dni && (update.dni = dni)

    await User.updateOne({ _id: ObjectId(userId) }, { $set: update })

    if(credits) {
      await User.updateOne({ _id: ObjectId(userId) }, { $set: { 'profile.credits': credits } })
    }
  })()
}
