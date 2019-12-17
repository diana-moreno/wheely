const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const retrievePractice = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - retrieve practice', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, adminId, name, surname, email, password, role, price, date, status, dates, practiceId, dni, token

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
    const id = student.id
    token = jwt.sign({ sub: id }, TEST_SECRET)

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
    let result = await retrievePractice(token, practiceId)
    const { practice } = result

    expect(practice).toBeDefined()
    expect(practice._id.toString()).toBe(practiceId)
    expect(practice.date).toBeDefined()
    expect(moment(practice.date).toString()).toBe(date.toString())
    expect(practice.price).toBe(price)
    expect(practice.instructorId._id.toString()).toBe(instructorId)
    expect(practice.studentId._id.toString()).toBe(studentId)
    expect(practice.feedback).toBe(undefined)
  })

  it('should fail on unexisting practice', async () => {
    let fakeId = '012345678901234567890123'
    try {
      await retrievePractice(token, fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`practice with id ${fakeId} not found`)
    }
  })

   it('should fail on incorrect user id type or content', () => {
      expect(() => retrievePractice(1)).toThrow(TypeError, '1 is not a string')
      expect(() => retrievePractice(true)).toThrow(TypeError, 'true is not a string')
      expect(() => retrievePractice([])).toThrow(TypeError, ' is not a string')
      expect(() => retrievePractice({})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => retrievePractice(undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => retrievePractice(null)).toThrow(TypeError, 'null is not a string')
     expect(() => retrievePractice('')).toThrow(ContentError, 'id is empty or blank')
    })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
