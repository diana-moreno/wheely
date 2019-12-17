require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const writeFeedback = require('.')
const { random } = Math
const { database, models: { User, Practice, Student, Instructor } } = require('wheely-data')
const { validate, errors: { ContentError } } = require('wheely-utils')
const moment = require('moment')

describe('logic - write feedback', () => {
  before(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, dni, password, role, price, status, date, valoration, feedback, practicesId, fakeId = '012345678901234567890123'

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
    expect(practice).to.exist

    feedback = 'Very well managing the clutch'
    valoration = 'good'

    await writeFeedback(instructorId, studentId, practiceId, feedback, valoration)
    let practiceFeedback = await Practice.findOne({ _id: practiceId })

    expect(practiceFeedback).to.exist
    expect(practiceFeedback.date).to.exist
    expect(practiceFeedback.date).to.be.instanceOf(Date)
    expect(practiceFeedback.date).to.exist
    expect(practiceFeedback.price).to.equal(1)
    expect(practiceFeedback.instructorId.toString()).to.equal(instructorId)
    expect(practiceFeedback.studentId.toString()).to.equal(studentId)
    expect(practiceFeedback.feedback).to.equal('Very well managing the clutch')
    expect(practiceFeedback.valoration).to.equal('good')
  })

  it('should fail on unexisting practice', async () => {
    try {
      let practiceFeedback = await writeFeedback(instructorId, studentId, fakeId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`practice with id ${fakeId} does not exists`)
    }
  })

  it('should fail on unexisting student', async () => {
    try {
      let practiceFeedback = await writeFeedback(instructorId, fakeId, practiceId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on unexisting instructor', async () => {
    try {
      let practiceFeedback = await writeFeedback(fakeId, studentId, practiceId, feedback, valoration)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })


  describe('logic - when practice is still in the future', () => {

    let studentId, instructorId, name, surname, email, dni, password, role, price, status, date, practicesId, fakeId = '012345678901234567890123'

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
        expect(practice).to.exist

        let feedback = 'she did it really well'
        let valoration = 'good'
        await writeFeedback(instructorId, studentId, practiceId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`practice with id ${practiceId} is already in the future`)
      }
    })

    it('should fail on unexisting practice', async () => {
      try {
        let practiceFeedback = await writeFeedback(instructorId, studentId, fakeId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`practice with id ${fakeId} does not exists`)
      }
    })

    it('should fail on unexisting student', async () => {
      try {
        let practiceFeedback = await writeFeedback(instructorId, fakeId, practiceId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user with id ${fakeId} not found`)
      }
    })

    it('should fail on unexisting instructor', async () => {
      try {
        let practiceFeedback = await writeFeedback(fakeId, studentId, practiceId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user with id ${fakeId} not found`)
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
        expect(practice).to.exist

        let feedback = 'she did it really bad'
        let valoration = 'bad'
        await writeFeedback(instructorId, studentId, practiceId, feedback, valoration)

        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`practice with id ${practiceId} has been already valorated`)
      }
    })

  })


  it('should fail on incorrect instructorId, studentId, practiceId, feedback, valoration type or content', () => {
    expect(() => writeFeedback('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => writeFeedback(1)).to.throw(TypeError, '1 is not a string')
    expect(() => writeFeedback(true)).to.throw(TypeError, 'true is not a string')
    expect(() => writeFeedback([])).to.throw(TypeError, ' is not a string')
    expect(() => writeFeedback({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(null)).to.throw(TypeError, 'null is not a string')
    expect(() => writeFeedback('')).to.throw(ContentError, 'instructorId is empty or blank')

    expect(() => writeFeedback(instructorId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => writeFeedback(instructorId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, [])).to.throw(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => writeFeedback(instructorId, '')).to.throw(ContentError, 'studentId is empty or blank')
    expect(() => writeFeedback(instructorId, ' \t\r')).to.throw(ContentError, 'studentId is empty or blank')

    expect(() => writeFeedback(instructorId, studentId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => writeFeedback(instructorId, studentId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, [])).to.throw(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => writeFeedback(instructorId, studentId, '')).to.throw(ContentError, 'practiceId is empty or blank')
    expect(() => writeFeedback(instructorId, studentId, ' \t\r')).to.throw(ContentError, 'practiceId is empty or blank')

    expect(() => writeFeedback(instructorId, studentId, practiceId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, [])).to.throw(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, null)).to.throw(TypeError, 'null is not a string')

    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, true)).to.throw(TypeError, 'true is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, [])).to.throw(TypeError, ' is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => writeFeedback(instructorId, studentId, practiceId, feedback, null)).to.throw(TypeError, 'null is not a string')
  })

  after(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
