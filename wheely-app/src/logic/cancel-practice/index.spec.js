const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const cancelPractice = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')
jest.setTimeout(100000000)
// Its needed to set the timeout beacause in this logic we are sending emails

fdescribe('logic - cancel practice', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, dni, password, role, date, credits, practiceId, token, id, unexistingId = '012345678901234567890123',
    fakeId = '123456'

  beforeEach(async () => {
    // create an student
    name = `j-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    password = `password-${random()}`
    dni = `dni-${random()}`
    role = 'student'

    await Promise.all([User.deleteMany(), Practice.deleteMany()])

    let student = await User.create({ name, surname, email, dni, password, role })
    student.profile = new Student()
    student.profile.credits = 3
    await student.save()
    id = student.id
    token = jwt.sign({ sub: id }, TEST_SECRET)

    // create an instructor
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    password = `password-${random()}`
    dni = `dni-${random()}`
    role = 'instructor'

    let instructor = await User.create({ name, surname, email, dni, password, role })
    instructor.profile = new Instructor()
    await instructor.save()
    instructorId = instructor.id

    // create practice
    date = moment().add(5, 'day')
    studentId = id
    let practice = await Practice.create({ instructorId, studentId, date })
    practiceId = practice.id

    // update student profile with a credit less
    student.profile.credits = student.profile.credits - practice.price

    await User.updateOne({ _id: id }, { $set: { 'profile.credits': student.profile.credits } }, { multi: true })

  })

  it('should succeed on correct users and pending practice', async () => {
    debugger
    let practice = await Practice.findOne({ _id: practiceId })
    expect(practice).toBeDefined()

    await cancelPractice(token, instructorId, practiceId)

    practice = await Practice.findOne({ _id: practiceId })
    expect(practice).toBe(null)
  })

  it('should fail on unexisting practice', async () => {
    try {
      await cancelPractice(token, instructorId, unexistingId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`practice with id ${unexistingId} not found`)
    }
  })

  it('should fail on unexisting student', async () => {
    try {
      const id = '012345678901234567890123'
      const token = jwt.sign({ sub: id }, TEST_SECRET)
      await cancelPractice(token, instructorId, practiceId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${unexistingId} not found`)
    }
  })

  it('should fail on unexisting instructor', async () => {
    try {
      const id = '012345678901234567890123'
      const token = jwt.sign({ sub: id }, TEST_SECRET)
      await cancelPractice(token, instructorId, practiceId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${unexistingId} not found`)
    }
  })

  describe('when practice is done', () => {
    beforeEach(async () => {
      // create an student
      name = `j-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      await Promise.all([User.deleteMany(), Practice.deleteMany()])

      let student = await User.create({ name, surname, email, dni, password, role })
      student.profile = new Student()
      await student.save()
      id = student.id
      studentId = id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create an instructor
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, dni, password, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id

      // create practice
      date = moment().subtract(5, "days")
      let practice = await Practice.create({ date, instructorId, studentId })
      practiceId = practice.id
    })

    it('should fail on done practice and correct users', async () => {
      try {
        await cancelPractice(token, instructorId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`practice with id ${practiceId} is not possible to cancel`)
      }
    })

    it('should fail on unexisting student and practice done', async () => {
      try {
        let id = '012345678901234567890123'
        token = jwt.sign({ sub: id }, TEST_SECRET)
        await cancelPractice(token, instructorId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with id ${unexistingId} not found`)
      }
    })

    it('should fail on unexisting instructor and practice done', async () => {
      try {
        await cancelPractice(token, unexistingId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with id ${unexistingId} not found`)
      }
    })

  })

  describe('when rest lest than 24h for the practice', () => {
    beforeEach(async () => {
      // create an student
      name = `j-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      await Promise.all([User.deleteMany(), Practice.deleteMany()])

      let student = await User.create({ name, surname, email, dni, password, role })
      student.profile = new Student()
      await student.save()
      id = student.id
      studentId = id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create an instructor
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, dni, password, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id

      // create practice
      date = moment()
      let practice = await Practice.create({ instructorId, studentId, date })
      practiceId = practice.id
    })

    it('should fail on trying to cancel with less than 24h of advance', async () => {
      try {
        await cancelPractice(token, instructorId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`practice with id ${practiceId} is not possible to cancel`)
      }
    })
  })

  it('should fail on incorrect instructorId, studentId, practiceId type or content', () => {
    expect(() => cancelPractice(1)).toThrow(TypeError, '1 is not a string')
    expect(() => cancelPractice(true)).toThrow(TypeError, 'true is not a string')
    expect(() => cancelPractice([])).toThrow(TypeError, ' is not a string')
    expect(() => cancelPractice({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(null)).toThrow(TypeError, 'null is not a string')

    expect(() => cancelPractice('')).toThrow(ContentError, 'instructorId is empty or blank')

    expect(() => cancelPractice(instructorId, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => cancelPractice(instructorId, true)).toThrow(TypeError, 'true is not a string')
    expect(() => cancelPractice(instructorId, [])).toThrow(TypeError, ' is not a string')
    expect(() => cancelPractice(instructorId, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(instructorId, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(instructorId, null)).toThrow(TypeError, 'null is not a string')
    expect(() => cancelPractice(instructorId, '')).toThrow(ContentError, 'studentId is empty or blank')
    expect(() => cancelPractice(instructorId, ' \t\r')).toThrow(ContentError, 'studentId is empty or blank')

    expect(() => cancelPractice(instructorId, studentId, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => cancelPractice(instructorId, studentId, true)).toThrow(TypeError, 'true is not a string')
    expect(() => cancelPractice(instructorId, studentId, [])).toThrow(TypeError, ' is not a string')
    expect(() => cancelPractice(instructorId, studentId, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(instructorId, studentId, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(instructorId, studentId, null)).toThrow(TypeError, 'null is not a string')
    expect(() => cancelPractice(instructorId, studentId, '')).toThrow(ContentError, 'practiceId is empty or blank')
    expect(() => cancelPractice(instructorId, studentId, ' \t\r')).toThrow(ContentError, 'practiceId is empty or blank')
  })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
