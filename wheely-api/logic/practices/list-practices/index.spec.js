require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const listPractices = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')

describe('logic - list practices', () => {
  before(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, adminId, name, surname, email, password, role, price, date, status, dates, dni, date1, date2

  beforeEach(async () => {
    // create an student
    name = `j-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'student'

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

    // create 2 practices with the same instructor and student
    price = 1
    let futureDate = moment().add(5, 'day').format('DD-MM-YYYY')
    let pastDate = moment().subtract(5, "days").format('DD-MM-YYYY')
    let time = '11:00'
    date1 = moment(`${futureDate} ${time}`, 'DD-MM-YYYY HH:mm')
    date2 = moment(`${pastDate} ${time}`, 'DD-MM-YYYY HH:mm')
    dates = [date1, date2]
    date = dates[0]
    await Practice.create({ date, instructorId, studentId, status })

    date = [dates[1]]
    valoration = 'bad'
    feedback = 'no respecting the traffic lights'
    await Practice.create({ date, instructorId, studentId, status, feedback, valoration })

  })

  it('should succeed on student listing practices', async () => {
    const date1 = new Date(dates[0])
    const date2 = new Date(dates[1])

    practices = await listPractices(studentId)

    expect(practices).to.exist
    expect(practices.length).to.equal(2)
    expect(practices[0].date.getTime()).to.equal(date1.getTime())
    expect(practices[1].date.getTime()).to.equal(date2.getTime())
  })

  it('should succeed on instructor listing practices', async () => {
    const date1 = new Date(dates[0])
    const date2 = new Date(dates[1])

    practices = await listPractices(studentId)

    expect(practices).to.exist
    expect(practices.length).to.equal(2)
    expect(practices[0].date.getTime()).to.equal(date1.getTime())
    expect(practices[1].date.getTime()).to.equal(date2.getTime())
  })


  it('should fail on unexisting user', async () => {
    let fakeId = '012345678901234567890123'
    try {
      await listPractices(fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on admin user', async () => {
    try {
      await listPractices(adminId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`admin has no practices`)
    }
  })

   it('should fail on incorrect user id type or content', () => {
      expect(() => listPractices('1')).to.throw(ContentError, '1 is not a valid id')
      expect(() => listPractices(1)).to.throw(TypeError, '1 is not a string')
      expect(() => listPractices(true)).to.throw(TypeError, 'true is not a string')
      expect(() => listPractices([])).to.throw(TypeError, ' is not a string')
      expect(() => listPractices({})).to.throw(TypeError, '[object Object] is not a string')
      expect(() => listPractices(undefined)).to.throw(TypeError, 'undefined is not a string')
      expect(() => listPractices(null)).to.throw(TypeError, 'null is not a string')
     expect(() => listPractices('')).to.throw(ContentError, 'userId is empty or blank')
    })

  after(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
