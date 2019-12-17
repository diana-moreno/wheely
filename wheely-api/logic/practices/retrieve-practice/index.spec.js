require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const retrievePractice = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')

describe('logic - retrieve practice', () => {
  before(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, adminId, name, surname, email, password, role, price, date, status, dates, practiceId, dni

  beforeEach(async () => {
    // create an student
    name = `j-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    password = `password-${random()}`
    role = 'student'
    dni = `dni-${random()}`

    await Promise.all([User.deleteMany(), Practice.deleteMany()])

    let student = await User.create({ name, surname, email, dni, password, role })
    student.profile = new Student()
    student.profile.credits = 3

    await student.save()
    studentId = student.id

    // create an instructor
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'instructor'

    let instructor = await User.create({ name, surname, email, dni, password, role})
    instructor.profile = new Instructor()
    await instructor.save()
    instructorId = instructor.id

    // create an admin
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'admin'

    let admin = await User.create({ name, surname, email, dni, password, role })
    adminId = admin.id

    // create practice
    price = 1
    date = moment().add(5, 'day')
    let practice = await Practice.create({ date, instructorId, studentId })
    practiceId = practice.id

  })

  it('should succeed on retrieving a practice', async () => {
    let practice = await retrievePractice(practiceId)
    debugger
    expect(practice).to.exist
    expect(practice._id.toString()).to.equal(practiceId)
    expect(practice.date).to.exist
    expect(moment(practice.date).toString()).to.equal(date.toString())
    expect(practice.price).to.equal(price)
    expect(practice.instructorId._id.toString()).to.equal(instructorId)
    expect(practice.studentId._id.toString()).to.equal(studentId)
    expect(practice.feedback).to.equal(undefined)
  })

  it('should fail on unexisting practice', async () => {
    let fakeId = '012345678901234567890123'
    try {
      await retrievePractice(fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`practice with id ${fakeId} not found`)
    }
  })

   it('should fail on incorrect user id type or content', () => {
      expect(() => retrievePractice('1')).to.throw(ContentError, '1 is not a valid id')
      expect(() => retrievePractice(1)).to.throw(TypeError, '1 is not a string')
      expect(() => retrievePractice(true)).to.throw(TypeError, 'true is not a string')
      expect(() => retrievePractice([])).to.throw(TypeError, ' is not a string')
      expect(() => retrievePractice({})).to.throw(TypeError, '[object Object] is not a string')
      expect(() => retrievePractice(undefined)).to.throw(TypeError, 'undefined is not a string')
      expect(() => retrievePractice(null)).to.throw(TypeError, 'null is not a string')
     expect(() => retrievePractice('')).to.throw(ContentError, 'id is empty or blank')
    })

  after(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
