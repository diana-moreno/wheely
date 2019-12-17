require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const cancelPractice = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')

describe('logic - cancel practice', () => {
  before(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, password, role, date, credits, practiceId, unexistingId = '012345678901234567890123',
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
    studentId = student.id

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
    let practice = await Practice.create({ date, instructorId, studentId })
    practiceId = practice.id

    // update student profile with a credit less
    student.profile.credits = student.profile.credits - practice.price

    await User.updateOne({ _id: studentId }, { $set: { 'profile.credits': student.profile.credits } }, { multi: true })

  })

  it('should succeed on correct users and pending practice', async () => {
    let practice = await Practice.findOne({ _id: practiceId })
    expect(practice).to.exist

    await cancelPractice(instructorId, studentId, practiceId)

    practice = await Practice.findOne({ _id: practiceId })
    expect(practice).to.equal(null)
  })

  it('should fail on unexisting practice', async () => {
    try {
      await cancelPractice(instructorId, studentId, unexistingId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`practice with id ${unexistingId} not found`)
    }
  })

  it('should fail on unexisting student', async () => {
    try {
      await cancelPractice(instructorId, unexistingId, practiceId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${unexistingId} not found`)
    }
  })

  it('should fail on unexisting instructor', async () => {
    try {
      await cancelPractice(unexistingId, studentId, practiceId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${unexistingId} not found`)
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
      studentId = student.id

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
        await cancelPractice(instructorId, studentId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`practice with id ${practiceId} is not possible to cancel`)
      }
    })

    it('should fail on unexisting student and practice done', async () => {
      try {
        await cancelPractice(instructorId, unexistingId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user with id ${unexistingId} not found`)
      }
    })

    it('should fail on unexisting instructor and practice done', async () => {
      try {
        await cancelPractice(unexistingId, studentId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user with id ${unexistingId} not found`)
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
      studentId = student.id

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
      let practice = await Practice.create({ date, instructorId, studentId })
      practiceId = practice.id
    })

    it('should fail on trying to cancel with less than 24h of advance', async () => {
      try {
        await cancelPractice(instructorId, studentId, practiceId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`practice with id ${practiceId} is not possible to cancel`)
      }
    })
  })

  it('should fail on incorrect instructorId, studentId, practiceId type or content', () => {
    expect(() => cancelPractice('1')).to.throw(ContentError, '1 is not a valid id')

    expect(() => cancelPractice(1)).to.throw(TypeError, '1 is not a string')
    expect(() => cancelPractice(true)).to.throw(TypeError, 'true is not a string')
    expect(() => cancelPractice([])).to.throw(TypeError, ' is not a string')
    expect(() => cancelPractice({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(null)).to.throw(TypeError, 'null is not a string')

    expect(() => cancelPractice('')).to.throw(ContentError, 'instructorId is empty or blank')

    expect(() => cancelPractice(instructorId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => cancelPractice(instructorId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => cancelPractice(instructorId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => cancelPractice(instructorId, [])).to.throw(TypeError, ' is not a string')
    expect(() => cancelPractice(instructorId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(instructorId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(instructorId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => cancelPractice(instructorId, '')).to.throw(ContentError, 'studentId is empty or blank')
    expect(() => cancelPractice(instructorId, ' \t\r')).to.throw(ContentError, 'studentId is empty or blank')

    expect(() => cancelPractice(instructorId, studentId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => cancelPractice(instructorId, studentId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => cancelPractice(instructorId, studentId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => cancelPractice(instructorId, studentId, [])).to.throw(TypeError, ' is not a string')
    expect(() => cancelPractice(instructorId, studentId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => cancelPractice(instructorId, studentId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => cancelPractice(instructorId, studentId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => cancelPractice(instructorId, studentId, '')).to.throw(ContentError, 'practiceId is empty or blank')
    expect(() => cancelPractice(instructorId, studentId, ' \t\r')).to.throw(ContentError, 'practiceId is empty or blank')
  })

  after(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
