require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const createPractice = require('.')
const { random } = Math
const { ObjectId, database, models: { User, Practice, Student, Instructor, Week, Day } } = require('wheely-data')
const { validate, errors: { NotFoundError, ConflictError, ContentError } } = require('wheely-utils')
const moment = require('moment')


describe('logic - book a practice', () => {
  before(() => database.connect(TEST_DB_URL))

  let studentId, instructorId, name, surname, email, dni, password, price, role, status, date, credits, instructor

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
    let student = await User.findOne({ _id: studentId, role: 'student' })
    let newCredits = student.profile.credits - 1
    const practiceId = await createPractice(instructorId, studentId, date)
    expect(practiceId).to.exist
    expect(practiceId).to.be.a('string')
    expect(practiceId).to.have.length.greaterThan(0)

    const practice = await Practice.findById(practiceId)

    expect(practice).to.exist
    expect(practice.date).to.exist
    expect(practice.date).to.be.instanceOf(Date)
    expect(practice.date.getTime()).to.equal(new Date(date).getTime())
    expect(practice.date).to.exist
    expect(practice.price).to.equal(price)
    expect(practice.instructorId.toString()).to.equal(instructorId)
    expect(practice.studentId.toString()).to.equal(studentId)
    expect(practice.feedback).to.equal(undefined)

    // retrieve the student to check how many credits has after doing a reservation
    student = await User.findOne({ _id: studentId, role: 'student' })
    expect(student.profile.credits).to.equal(newCredits)
  })

  it('should fail when the instructor does not have this date in his schedule', async () => {
    let onlyDate = moment().add(5, 'day').format('DD-MM-YYYY')
    let time = '14:00'
    date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')
    try {
      await createPractice(instructorId, studentId, date)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error).to.be.an.instanceOf(ConflictError)
      expect(error.message).to.equal(`instructor has not available date ${date}`)
    }
  })

  it('should fail on unexisting student', async () => {
    let fakeId = '012345678901234567890123'
    try {
      await createPractice(instructorId, fakeId, date)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error).to.be.an.instanceOf(NotFoundError)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on expired date', async () => {
    let expiredDate = moment().day(-1)
    try {
      await createPractice(instructorId, studentId, expiredDate)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`practice with date ${expiredDate} has expired`)
    }
  })

  it('should fail on unexisting instructor', async () => {
    let fakeId = '012345678901234567890123'
    try {
      await createPractice(fakeId, studentId, date)

      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error.message).to.exist
      expect(typeof error.message).to.equal('string')
      expect(error.message.length).to.be.greaterThan(0)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
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
      studentId = student.id


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
        await createPractice(instructorId, studentId, date)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user has no credits`)
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
      practice = await Practice.create({ date, instructorId, studentId })
      practiceId = practice.id
    })

    it('should fail on already existing practice', async () => {
      // we try to create a new practice with the same data which is imposible
      let onlyDate = moment().add(6, 'day').format('DD-MM-YYYY')
      let time = '13:00'
      date = moment(`${onlyDate} ${time}`, 'DD-MM-YYYY HH:mm')
      try {
        let practiceSaved = await Practice.findById(practiceId)
        expect(practiceSaved).to.exist
        await createPractice(instructorId, studentId, date)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
      }
    })

  })

  it('should fail on incorrect instructorId, studentId, date type or content', () => {
    expect(() => createPractice('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => createPractice(1)).to.throw(TypeError, '1 is not a string')
    expect(() => createPractice(true)).to.throw(TypeError, 'true is not a string')
    expect(() => createPractice([])).to.throw(TypeError, ' is not a string')
    expect(() => createPractice({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => createPractice(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => createPractice(null)).to.throw(TypeError, 'null is not a string')
    expect(() => createPractice('')).to.throw(ContentError, 'instructorId is empty or blank')

    expect(() => createPractice(instructorId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => createPractice(instructorId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => createPractice(instructorId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => createPractice(instructorId, [])).to.throw(TypeError, ' is not a string')
    expect(() => createPractice(instructorId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => createPractice(instructorId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => createPractice(instructorId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => createPractice(instructorId, '')).to.throw(ContentError, 'studentId is empty or blank')
    expect(() => createPractice(instructorId, ' \t\r')).to.throw(ContentError, 'studentId is empty or blank')
  })

  after(() => Promise.all([User.deleteMany(), Practice.deleteMany()]).then(database.disconnect))
})
