require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const listUsers = require('.')
const { random, floor } = Math
const { errors: { ContentError } } = require('wheely-utils')
const { database, models: { User, Practice, Student, Instructor, Admin } } = require('wheely-data')
const moment = require('moment')

describe('logic - list users', () => {
  before(() => database.connect(TEST_DB_URL))

  let roles = ['student', 'instructor']
  let name, surname, email, password, role, names, surnames, emails, passwords, ids, adminId, studentId, instructorId, studentsCounter, instructorsCounter

  beforeEach(async () => {
    await Promise.all([User.deleteMany()])

    ids = []
    names = []
    surnames = []
    emails = []
    passwords = []
    dnis = []
    studentsCounter = 0
    instructorsCounter = 0
    const insertions = []

    for (let i = 0; i < 10; i++) {
      const user = {
        name: `name-${random()}`,
        surname: `surname-${random()}`,
        email: `email-${random()}@mail.com`,
        password: `password-${random()}`,
        dni: `dni-${random()}`,
        role: roles[floor(random() * 2)]
      }
      let currentUser = await User.create(user)
      insertions.push(currentUser)
      names.push(currentUser.name)
      surnames.push(currentUser.surname)
      emails.push(currentUser.email)
      passwords.push(currentUser.password)
      dnis.push(currentUser.dni)
      currentUser.role === 'student' && studentsCounter++
      currentUser.role === 'instructor' && instructorsCounter++
      ids.push(currentUser._id.toString())
    }
    await Promise.all(insertions)
  })

  describe('logic - when user is an admin', () => {
    beforeEach(async () => {
      //create an admin who wants to list the other users
      let admin = await User.create({
        name: `name-${random()}`,
        surname: `surname-${random()}`,
        email: `email-${random()}@mail.com`,
        password: `password-${random()}`,
        dni: `dni-${random()}`,
        role: 'admin'
      })

      adminId = admin.id
    })

    it('should succeed on admin retrieving instructors and students users', async () => {
      // we need the id of the user who want to list
      let totalUsers = instructorsCounter + studentsCounter
      const users = await listUsers(adminId)

      expect(users).to.exist
      expect(users).to.have.lengthOf(totalUsers) // 10 in loop

      users.forEach(user => {
        expect(user._id).to.exist
        expect(user.name).to.exist
        expect(user.name).to.be.a('string')
        expect(user.name).to.have.length.greaterThan(0)
        expect(user.name).be.oneOf(names)
        expect(user.surname).to.exist
        expect(user.surname).to.be.a('string')
        expect(user.surname).to.have.length.greaterThan(0)
        expect(user.surname).be.oneOf(surnames)
        expect(user.password).to.exist
        expect(user.password).to.be.a('string')
        expect(user.password).to.have.length.greaterThan(0)
        expect(user.password).be.oneOf(passwords)
        expect(user.dni).to.exist
        expect(user.dni).to.be.a('string')
        expect(user.dni).to.have.length.greaterThan(0)
        expect(user.dni).be.oneOf(dnis)
        expect(user.email).to.exist
        expect(user.email).to.be.a('string')
        expect(user.email).to.have.length.greaterThan(0)
        expect(user.email).be.oneOf(emails)
      })
    })

    it('should fail on unexisting user', async () => {
      let fakeId = '012345678901234567890123'
      try {
        await listUsers(fakeId)
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

  describe('logic - when user is an student', () => {
    beforeEach(async () => {
      //create an admin who wants to list the other users
      let student = await User.create({
        name: `name-${random()}`,
        surname: `surname-${random()}`,
        email: `email-${random()}@mail.com`,
        password: `password-${random()}`,
        dni: `dni-${random()}`,
        role: 'student'
      })

      studentId = student.id
    })

    it('should succeed on admin retrieving instructors and students users', async () => {
      // we need the id of the user who want to list
      const users = await listUsers(studentId)

      expect(users).to.exist
      expect(users).to.have.lengthOf(instructorsCounter) // 10 in loop

      users.forEach(user => {
        expect(user._id).to.exist
        expect(user.name).to.exist
        expect(user.name).to.be.a('string')
        expect(user.name).to.have.length.greaterThan(0)
        expect(user.name).be.oneOf(names)
        expect(user.surname).to.exist
        expect(user.surname).to.be.a('string')
        expect(user.surname).to.have.length.greaterThan(0)
        expect(user.surname).be.oneOf(surnames)
        expect(user.password).to.exist
        expect(user.password).to.be.a('string')
        expect(user.password).to.have.length.greaterThan(0)
        expect(user.password).be.oneOf(passwords)
        expect(user.dni).to.exist
        expect(user.dni).to.be.a('string')
        expect(user.dni).to.have.length.greaterThan(0)
        expect(user.dni).be.oneOf(dnis)
        expect(user.email).to.exist
        expect(user.email).to.be.a('string')
        expect(user.email).to.have.length.greaterThan(0)
        expect(user.email).be.oneOf(emails)
      })
    })

    it('should fail on unexisting user', async () => {
      let fakeId = '012345678901234567890123'
      try {
        await listUsers(fakeId)
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

  describe('logic - when user is an instructor', () => {

    let studentId, instructorId, name, surname, email, password, role, price, status, date, credits, student, practiceId, feedback, valoration, dni

    beforeEach(async () => {
      // create an student
      name = `j-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      let student = await User.create({ name, surname, email, password, dni, role })
      student.profile = new Student()
      student.profile.credits = 3
      credits = 3
      await student.save()
      studentId = student.id

      // create an instructor
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'instructor'

      let instructor = await User.create({ name, surname, email, password, dni, role })
      instructor.profile = new Instructor()
      await instructor.save()
      instructorId = instructor.id

      // create 1 practice now
      date = moment()
      let practice = await Practice.create({ date, instructorId, studentId })
      practice.save()

    })

    it('should succeed on correct user', async () => {
      const users = await listUsers(instructorId)
      expect(users).to.exist
      expect(users).to.have.lengthOf(1)

      users.forEach(user => {
        expect(user._id).to.exist
        expect(user.name).to.exist
        expect(user.name).to.be.a('string')
        expect(user.name).to.have.length.greaterThan(0)
        expect(user.name).not.to.be.oneOf(names)
        expect(user.surname).to.exist
        expect(user.surname).to.be.a('string')
        expect(user.surname).to.have.length.greaterThan(0)
        expect(user.surname).not.to.be.oneOf(surnames)
        expect(user.password).to.exist
        expect(user.password).to.be.a('string')
        expect(user.password).to.have.length.greaterThan(0)
        expect(user.password).not.to.be.oneOf(passwords)
        expect(user.dni).to.exist
        expect(user.dni).to.be.a('string')
        expect(user.dni).to.have.length.greaterThan(0)
        expect(user.dni).not.to.be.oneOf(dnis)
        expect(user.email).to.exist
        expect(user.email).to.be.a('string')
        expect(user.email).to.have.length.greaterThan(0)
        expect(user.email).not.to.be.oneOf(emails)
      })
    })
  })

  it('should fail on incorrect id type or content', () => {
    expect(() => listUsers('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => listUsers(1)).to.throw(TypeError, '1 is not a string')
    expect(() => listUsers(true)).to.throw(TypeError, 'true is not a string')
    expect(() => listUsers([])).to.throw(TypeError, ' is not a string')
    expect(() => listUsers({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => listUsers(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => listUsers(null)).to.throw(TypeError, 'null is not a string')
    expect(() => listUsers('')).to.throw(ContentError, 'id is empty or blank')
    expect(() => listUsers(' \t\r')).to.throw(ContentError, 'id is empty or blank')
  })

  after(() => Promise.all([User.deleteMany()]).then(database.disconnect))
})
