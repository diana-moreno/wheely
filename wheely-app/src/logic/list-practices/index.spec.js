const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const listPractices = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')
require('../../helpers/jest-matchers')

describe('logic - list practices', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, adminId, name, surname, email, password, role, price, date, dni, status, dates, tokenStudent, tokenInstructor, tokenAdmin, id, date1, date2

  beforeEach(async () => {
    // create an student
    name = `j-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    password = `password-${random()}`
    dni = `dni-${random()}`
    role = 'student'

    await Promise.all([User.deleteMany(), Practice.deleteMany()])

    let student = await User.create({ name, surname, email, password, dni, role })
    student.profile = new Student()
    student.profile.credits = 3

    await student.save()
    id = student.id
    tokenStudent = jwt.sign({ sub: id }, TEST_SECRET)
    studentId = id

    // create an instructor
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'instructor'

    let instructor = await User.create({ name, surname, email, password, dni, role })
    instructor.profile = new Instructor()
    await instructor.save()
    id = instructor.id
    instructorId = id
    tokenInstructor = jwt.sign({ sub: id }, TEST_SECRET)

    // create an admin
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'admin'

    let admin = await User.create({ name, surname, email, password, dni, role })
    id = admin.id
    adminId = id
    tokenAdmin = jwt.sign({ sub: id }, TEST_SECRET)

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
    const valoration = 'bad'
    const feedback = 'no respecting the traffic lights'
    await Practice.create({ date, instructorId, studentId, status, feedback, valoration })
  })

  it('should succeed on student listing practices', async () => {

    const date1 = new Date(dates[0])
    const date2 = new Date(dates[1])

    const result = await listPractices(tokenStudent, studentId)
    const { practices } = result

    expect(practices).toBeDefined()
    expect(practices.length).toBe(2)
    expect(moment(practices[0].date).toString()).toBe(moment(date1).toString())
    expect(moment(practices[1].date).toString()).toBe(moment(date2).toString())
  })

  it('should succeed on instructor listing practices', async () => {
    const date1 = new Date(dates[0])
    const date2 = new Date(dates[1])

    const result = await listPractices(tokenInstructor, instructorId)
    const { practices } = result

    expect(practices).toBeDefined()
    expect(practices.length).toBe(2)
    expect(moment(practices[0].date).toString()).toBe(moment(date1).toString())
    expect(moment(practices[1].date).toString()).toBe(moment(date2).toString())
  })

  it('should fail on unexisting user', async () => {
    const id = '012345678901234567890123'

    try {
      await listPractices(tokenStudent, id)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${id} not found`)
    }
  })

  it('should fail on admin user', async () => {
    try {
      await listPractices(tokenAdmin, adminId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`admin has no practices`)
    }
  })

   it('should fail on incorrect user id type or content', () => {
      expect(() => listPractices(1)).toThrow(TypeError, '1 is not a string')
      expect(() => listPractices(true)).toThrow(TypeError, 'true is not a string')
      expect(() => listPractices([])).toThrow(TypeError, ' is not a string')
      expect(() => listPractices({})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => listPractices(undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => listPractices(null)).toThrow(TypeError, 'null is not a string')
     expect(() => listPractices('')).toThrow(ContentError, 'userId is empty or blank')
    })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
