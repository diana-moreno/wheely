const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const writeFeedback = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')

describe('logic - write feedback', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, dni, password, role, price, status, date, valoration, feedback, practice, practiceId, token, practicesId, fakeId = '012345678901234567890123'

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
    password = `password-${random()}`
    role = 'instructor'

    let instructor = await User.create({ name, surname, email, dni, password, role })
    instructor.profile = new Instructor()
    await instructor.save()
    instructorId = instructor.id
    const id = instructorId
    token = jwt.sign({ sub: id }, TEST_SECRET)

    practicesId = []

    // create practice in the past
    let pastDate = moment().subtract(5, "days").format('DD-MM-YYYY')
    let time = '15:00'
    date = moment(`${pastDate} ${time}`, 'DD-MM-YYYY HH:mm')
    practice = await Practice.create({ date, instructorId, studentId })
    practiceId = practice.id
  })

  it('should succeed on correct users and practice in the past', async () => {
    practice = await Practice.findOne({ _id: practiceId })
    expect(practice).toBeDefined()

    feedback = 'Very well managing the clutch'
    valoration = 'good'

    await writeFeedback(token, practiceId, studentId, feedback, valoration)
    let practiceFeedback = await Practice.findOne({ _id: practiceId })

    expect(practiceFeedback).toBeDefined()
    expect(practiceFeedback.date).toBeDefined()
    expect(practiceFeedback.date).toBeInstanceOf(Date)
    expect(practiceFeedback.date).toBeDefined()
    expect(practiceFeedback.price).toBe(1)
    expect(practiceFeedback.instructorId.toString()).toBe(instructorId)
    expect(practiceFeedback.studentId.toString()).toBe(studentId)
    expect(practiceFeedback.feedback).toBe('Very well managing the clutch')
    expect(practiceFeedback.valoration).toBe('good')
  })

  it('should fail on unexisting practice', async () => {
    try {
      await writeFeedback(token, fakeId, studentId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`practice with id ${fakeId} does not exists`)
    }
  })

  it('should fail on unexisting student', async () => {
    try {
      await writeFeedback(token, practiceId, fakeId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on unexisting instructor', async () => {
    const id = fakeId
    const fakeToken = jwt.sign({ sub: id }, TEST_SECRET)
    try {
      await writeFeedback(fakeToken, studentId, practiceId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
    }
  })


  describe('logic - when practice is still in the future', () => {

    let studentId, instructorId, name, surname, email, dni, password, role, price, status, date, practicesId, token, practice, practiceId, fakeId = '012345678901234567890123'

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
      password = `password-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, dni, password, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id
      const id = instructorId
      token = jwt.sign({ sub: id }, TEST_SECRET)

      practicesId = []

      // create practice in the future
      let futureDate = moment().add(5, 'day').format('DD-MM-YYYY')
      let time = '11:00'
      date = moment(`${futureDate} ${time}`, 'DD-MM-YYYY HH:mm')
      practice = await Practice.create({ date, instructorId, studentId })
      practiceId = practice.id
    })

    it('should fail on write feedback on practice in the future', async () => {
      try {
        practice = await Practice.findOne({ _id: practiceId })
        expect(practice).toBeDefined()

        let feedback = 'she did it really well'
        let valoration = 'good'
        await writeFeedback(token, practiceId, studentId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`practice with id ${practiceId} is already in the future`)
      }
    })

    it('should fail on unexisting practice', async () => {
      try {
        await writeFeedback(token, fakeId, studentId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`practice with id ${fakeId} does not exists`)
      }
    })

    it('should fail on unexisting student', async () => {
      try {
        await writeFeedback(token, practiceId, fakeId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with id ${fakeId} not found`)
      }
    })

    it('should fail on unexisting instructor', async () => {
      const id = fakeId
      const fakeToken = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await writeFeedback(fakeToken, studentId, practiceId, feedback, valoration)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
      }
    })
  })

  describe('when feedback has already been written', () => {
    let practiceId

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
      password = `password-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, dni, password, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id
      const id = instructorId
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create practice
      let pastDate = moment().subtract(5, "days").format('DD-MM-YYYY')
      let time = '12:00'
      date = moment(`${pastDate} ${time}`, 'DD-MM-YYYY HH:mm')
      feedback = 'Very bad managing the clutch'
      valoration = 'bad'
      let practice = await Practice.create({ date, instructorId, studentId, feedback, valoration })
      practiceId = practice.id
    })

    it('should fail on write feedback on already wrtiten feedback', async () => {
      try {
        practice = await Practice.findOne({ _id: practiceId })
        expect(practice).toBeDefined()

        let feedback = 'she did it really bad'
        let valoration = 'bad'
        await writeFeedback(token, practiceId, studentId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`practice with id ${practiceId} has been already valorated`)
      }
    })

  })

  it('should fail on incorrect instructorId, studentId, practiceId, feedback, valoration type or content', () => {
    expect(() => writeFeedback(1)).toThrow(TypeError, '1 is not a string')
    expect(() => writeFeedback(true)).toThrow(TypeError, 'true is not a string')
    expect(() => writeFeedback([])).toThrow(TypeError, ' is not a string')
    expect(() => writeFeedback({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(null)).toThrow(TypeError, 'null is not a string')
    expect(() => writeFeedback('')).toThrow(ContentError, 'instructorId is empty or blank')

    expect(() => writeFeedback(instructorId, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, true)).toThrow(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, [])).toThrow(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, null)).toThrow(TypeError, 'null is not a string')
    expect(() => writeFeedback(instructorId, '')).toThrow(ContentError, 'studentId is empty or blank')
    expect(() => writeFeedback(instructorId, ' \t\r')).toThrow(ContentError, 'studentId is empty or blank')

    expect(() => writeFeedback(instructorId, studentId, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, true)).toThrow(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, [])).toThrow(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, null)).toThrow(TypeError, 'null is not a string')
    expect(() => writeFeedback(instructorId, studentId, '')).toThrow(ContentError, 'practiceId is empty or blank')
    expect(() => writeFeedback(instructorId, studentId, ' \t\r')).toThrow(ContentError, 'practiceId is empty or blank')

    expect(() => writeFeedback(instructorId, studentId, practiceId, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, true)).toThrow(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, [])).toThrow(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, null)).toThrow(TypeError, 'null is not a string')

    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, true)).toThrow(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, [])).toThrow(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, null)).toThrow(TypeError, 'null is not a string')
  })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
