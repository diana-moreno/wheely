const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const toggleSchedule = require('.')
const { random } = Math
const { ObjectId, database, models: { User, Practice, Student, Instructor, Week, Day } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')

describe('logic - toogle schedule instructor', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, password, role, price, status, date, practId, credits, student, dni, adminId, feedback, token, puntuation, instructor, id, tokenInstructor, indexDay = 0

  beforeEach(async () => {
    // create an instructor
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'instructor'

    await User.deleteMany()

    let instructor = await User.create({ name, surname, email, dni, password, role })

    // create a schedule for an instructor, he works every day 11-13h
    instructor = await User.findOne({ _id: ObjectId(instructor.id), role: 'instructor' })

    instructor.profile = new Instructor()
    instructor = await User.findOneAndUpdate({ _id: ObjectId(instructor.id) }, { $set: instructor })
    instructor.profile.schedule = new Week()

    for (let i = 0; i < 7; i++) {
      instructor.profile.schedule.days.push(new Day({ index: i, hours: [] }))
    }
    await User.updateOne({ _id: ObjectId(instructor.id) }, { $set: instructor })
    instructorId = instructor.id
    instructorId = instructor.id
    id = instructorId
    tokenInstructor = jwt.sign({ sub: id }, TEST_SECRET)


    // create an admin
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    dni = `dni-${random()}`
    password = `password-${random()}`
    role = 'admin'

    let admin = await User.create({ name, surname, email, dni, password, role })
    adminId = admin.id
    id = adminId
    token = jwt.sign({ sub: id }, TEST_SECRET)
  })

  it('should succeed on admin saving dates to instructor', async () => {
    const day1 = { index: 3, hours: [11] }
    const indexDay1 = 1
    const indexDay2 = 1
    const indexDay3 = 2
    const indexDay4 = 2
    const hour1 = '12:00'
    const hour2 = '11:00'
    const hour3 = '09:00'
    const hour4 = '09:00'

    let response = await toggleSchedule(token, instructorId, indexDay1, hour1)
    response = await toggleSchedule(token, instructorId, indexDay2, hour2)
    response = await toggleSchedule(token, instructorId, indexDay3, hour3)
    response = await toggleSchedule(token, instructorId, indexDay4, hour4)
    const { instructor } = response

    expect(instructor).toBeDefined()
    expect(instructor.profile).toBeDefined()
    expect(instructor.profile.schedule).toBeDefined()
    expect(instructor.profile.schedule.days[1].hours).toContain(hour1)
    expect(instructor.profile.schedule.days[1].hours).toContain(hour2)
    expect(instructor.profile.schedule.days[2].hours).not.toContain(hour3)
    expect(instructor.profile.schedule.days[2].hours).not.toContain(hour4)
  })

  it('should fail on admin and unexisting instructor', async () => {
    const hour4 = '09:00'
    const indexDay4 = 2
    const fakeId = '012345678901234567890123'
    try {
      instructor = await toggleSchedule(token, fakeId, indexDay4, hour4)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on unexisting admin', async () => {
    const hour4 = '09:00'
    const indexDay4 = 2
    const id = '012345678901234567890123'
    const token = jwt.sign({ sub: id }, TEST_SECRET)
    try {
      instructor = await toggleSchedule(token, instructorId, indexDay4, hour4)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${id} does not have permission`)
    }
  })

  it('should fail on instructor toggling schedule', async () => {
    const hour4 = '09:00'
    const indexDay4 = 2
    try {
      instructor = await toggleSchedule(tokenInstructor, instructorId, indexDay4, hour4)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBeDefined()
      expect(typeof error.message).toBe('string')
      expect(error.message.length).toBeGreaterThan(0)
      expect(error.message).toBe(`user with id ${instructorId} does not have permission`)
    }
  })

    it('should fail on incorrect adminId, instructorId, indexDay or hour valoration type or content', () => {
      expect(() => toggleSchedule(1)).toThrow(TypeError, '1 is not a string')
      expect(() => toggleSchedule(true)).toThrow(TypeError, 'true is not a string')
      expect(() => toggleSchedule([])).toThrow(TypeError, ' is not a string')
      expect(() => toggleSchedule({})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => toggleSchedule(undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => toggleSchedule(null)).toThrow(TypeError, 'null is not a string')
      expect(() => toggleSchedule('')).toThrow(ContentError, 'adminId is empty or blank')

      expect(() => toggleSchedule(adminId, 1)).toThrow(TypeError, '1 is not a string')
      expect(() => toggleSchedule(adminId, true)).toThrow(TypeError, 'true is not a string')
      expect(() => toggleSchedule(adminId, [])).toThrow(TypeError, ' is not a string')
      expect(() => toggleSchedule(adminId, {})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => toggleSchedule(adminId, undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => toggleSchedule(adminId, null)).toThrow(TypeError, 'null is not a string')
      expect(() => toggleSchedule(adminId, '')).toThrow(ContentError, 'instructorId is empty or blank')
      expect(() => toggleSchedule(adminId, ' \t\r')).toThrow(ContentError, 'instructorId is empty or blank')

      expect(() => toggleSchedule(adminId, instructorId, '1')).toThrow(TypeError, '1 is not a number')
      expect(() => toggleSchedule(adminId, instructorId, true)).toThrow(TypeError, 'true is not a number')
      expect(() => toggleSchedule(adminId, instructorId, [])).toThrow(TypeError, ' is not a number')
      expect(() => toggleSchedule(adminId, instructorId, {})).toThrow(TypeError, '[object Object] is not a number')
      expect(() => toggleSchedule(adminId, instructorId, undefined)).toThrow(TypeError, 'undefined is not a number')
      expect(() => toggleSchedule(adminId, instructorId, null)).toThrow(TypeError, 'null is not a number')

      expect(() => toggleSchedule(adminId, instructorId, indexDay, 1)).toThrow(TypeError, '1 is not a string')
      expect(() => toggleSchedule(adminId, instructorId, indexDay, true)).toThrow(TypeError, 'true is not a string')
      expect(() => toggleSchedule(adminId, instructorId, indexDay, [])).toThrow(TypeError, ' is not a string')
      expect(() => toggleSchedule(adminId, instructorId, indexDay, {})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => toggleSchedule(adminId, instructorId, indexDay, undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => toggleSchedule(adminId, instructorId, indexDay, null)).toThrow(TypeError, 'null is not a string')

    })

  afterAll(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
