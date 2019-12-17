const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const createPractice = require('.')
const { random } = Math
const { ObjectId, database, models: { User, Practice, Student, Instructor, Week, Day } } = require('wheely-data')
const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const moment = require('moment')
require('../../helpers/jest-matchers')
jest.setTimeout(100000000)
// Its needed to set the timeout beacause in this logic we are sending emails

fdescribe('logic - book a practice', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, dni, password, price, role, status, date, credits, instructor, token, id, practiceId

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
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'instructor'

    let instructor = await User.create({ name, surname, email, dni, password, role })

    // create a schedule for an instructor, he works every day 11-13h
    instructor = await User.findOne({ _id: ObjectId(instructor.id), role: 'instructor' })

    instructor.profile = new Instructor()
    instructor = await User.findOneAndUpdate({ _id: ObjectId(instructor.id) }, { $set: instructor })
    instructor.profile.schedule = new Week()

    for (let i = 0; i < 7; i++) {
      instructor.profile.schedule.days.push(new Day({ index: i, hours: ['11:00', '12:00'] }))
    }
    await User.updateOne({ _id: ObjectId(instructor.id) }, { $set: instructor })
    instructorId = instructor.id

    // practice's features
    price = 1
    let onlyDate = moment().add(5, 'day').format('DD-MM-YYYY')
    let time = '11:00'
    date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')

  })

  it('should succeed when student has credits', async () => {
    // calculate the newCredits the student should have after doing a reservation
    let student = await User.findOne({ _id: id, role: 'student' })
    let newCredits = student.profile.credits - 1
    debugger
    const practiceId = await createPractice(token, instructorId, date)
    debugger
    expect(practiceId).toBeDefined()
    expect(practiceId).toBeOfType('string')
    expect(practiceId).toHaveLengthGreaterThan(0)

    const practice = await Practice.findById(practiceId)

    expect(practice).toBeDefined()
    expect(practice.date).toBeDefined()
    expect(practice.date).toBeInstanceOf(Date)
    expect(practice.date.getTime()).toBe(new Date(date).getTime())
    expect(practice.date).toBeDefined()
    expect(practice.price).toBe(price)
    expect(practice.instructorId.toString()).toBe(instructorId)
    expect(practice.studentId.toString()).toBe(id)
    expect(practice.feedback).toBe(undefined)

    // retrieve the student to check how many credits has after doing a reservation
    student = await User.findOne({ _id: id, role: 'student' })
    expect(student.profile.credits).toBe(newCredits)
  })

  it('should fail when the instructor does not have this date in his schedule', async () => {
    let onlyDate = moment().add(5, 'day').format('DD-MM-YYYY')
    let time = '14:00'
    date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')
    try {
      await createPractice(token, instructorId, date)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
    }
  })

  it('should fail on unexisting student', async () => {
    let id = '012345678901234567890123'
    token = jwt.sign({ sub: id }, TEST_SECRET)
    try {
      await createPractice(token, instructorId, date)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${id} not found`)
    }
  })

  it('should fail on expired date', async () => {
    let date = moment().day(-1)
    try {
      await createPractice(token, instructorId, date)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
    }
  })

  it('should fail on unexisting instructor', async () => {
    let id = '012345678901234567890123'
    token = jwt.sign({ sub: id }, TEST_SECRET)
    try {
      await createPractice(token, instructorId, date)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBeOfType('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${id} not found`)
    }
  })

  describe('logic - when user has no credits', () => {
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

      await student.save()
      id = student.id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create an instructor
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      dni = `dni-${random()}`
      password = `password-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, dni, password, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id

      // practice's features
      price = 1
      date = new Date()
    })

    it('should fail when user has no credits available', async () => {
      try {
        await createPractice(token, instructorId, date)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBeOfType('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user has no credits`)
      }
    })
  })

  describe('when practice already exists', () => {
    beforeEach(async () => {
      // create an student
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      dni = `dni-${random()}`
      password = `password-${random()}`
      role = 'student'

      await Promise.all([User.deleteMany(), Practice.deleteMany()])

      const student = await User.create({ name, surname, email, dni, password, role })
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

      let instructor = await User.create({ name, surname, email, dni, password, role })
      // create a schedule for an instructor, he works every day 11-13h
      instructor = await User.findOne({ _id: ObjectId(instructor.id), role: 'instructor' })

      instructor.profile = new Instructor()
      instructor = await User.findOneAndUpdate({ _id: ObjectId(instructor.id) }, { $set: instructor })
      instructor.profile.schedule = new Week()

      for (let i = 0; i < 7; i++) {
        instructor.profile.schedule.days.push(new Day({ index: i, hours: ['11:00', '12:00'] }))
      }
      await User.updateOne({ _id: ObjectId(instructor.id) }, { $set: instructor })
      instructorId = instructor.id

      // practice's features
      price = 1
      let onlyDate = moment().add(6, 'day').format('DD-MM-YYYY')
      let time = '13:00'
      date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')
      let practice = await Practice.create({ date, instructorId, studentId })
      practiceId = practice.id
    })

    it('should fail on already existing practice', async () => {
      // we try to create a new practice with the same data which is imposible
      let onlyDate = moment().add(6, 'day').format('DD-MM-YYYY')
      let time = '13:00'
      date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')
      try {
        let practiceSaved = await Practice.findById(practiceId)
        expect(practiceSaved).toBeDefined()

        await createPractice(token, instructorId, date)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBeOfType('string')
        expect(error.message.length).toBeGreaterThan(0)
      }
    })

  })

  it('should fail on incorrect instructorId, studentId, date type or content', () => {
    expect(() => createPractice(token, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => createPractice(token, true)).toThrow(TypeError, 'true is not a string')
    expect(() => createPractice(token, [])).toThrow(TypeError, ' is not a string')
    expect(() => createPractice(token, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => createPractice(token, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => createPractice(token, null)).toThrow(TypeError, 'null is not a string')
    expect(() => createPractice(token, '')).toThrow(ContentError, 'instructorId is empty or blank')
  })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
