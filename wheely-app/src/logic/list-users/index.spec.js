const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const listUsers = require('.')
const { random, floor } = Math
const { errors: { ContentError } } = require('wheely-utils')
const { database, models: { User, Practice, Student, Instructor, Admin } } = require('wheely-data')
const moment = require('moment')
require('../../helpers/jest-matchers')
/*jest.setTimeout(100000000)*/

describe('logic - list users', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let roles = ['student', 'instructor']
  let name, surname, email, password, role, names, surnames, emails, passwords, ids, adminId, studentId, instructorId, studentsCounter, instructorsCounter, token, id, dnis

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

      id = admin.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on admin retrieving instructors and students users', async () => {
      // we need the id of the user who want to list
      let totalUsers = instructorsCounter + studentsCounter
      const result = await listUsers(token)
      const { users } = result
      expect(users).toBeDefined()
      expect(users).toHaveLength(totalUsers) // 10 in loop

      users.forEach(user => {
        expect(user._id).toBeDefined()
        expect(user.name).toBeDefined()
        expect(user.name).toBeOfType('string')
        expect(user.name).toHaveLengthGreaterThan(0)
        expect(user.name).toBeOneOf(names)
        expect(user.surname).toBeDefined()
        expect(user.surname).toBeOfType('string')
        expect(user.surname).toHaveLengthGreaterThan(0)
        expect(user.surname).toBeOneOf(surnames)
        expect(user.password).toBeDefined()
        expect(user.password).toBeOfType('string')
        expect(user.password).toHaveLengthGreaterThan(0)
        expect(user.password).toBeOneOf(passwords)
        expect(user.dni).toBeDefined()
        expect(user.dni).toBeOfType('string')
        expect(user.dni).toHaveLengthGreaterThan(0)
        expect(user.dni).toBeOneOf(dnis)
        expect(user.email).toBeDefined()
        expect(user.email).toBeOfType('string')
        expect(user.email).toHaveLengthGreaterThan(0)
        expect(user.email).toBeOneOf(emails)
      })
    })
})


    it('should fail on unexisting user', async () => {
      let id = '012345678901234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await listUsers(token)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with id ${id} not found`)
      }
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

      id = student.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on admin retrieving instructors and students users', async () => {
      // we need the id of the user who want to list
      const result = await listUsers(token)
      const { users } = result

      expect(users).toBeDefined()
      expect(users).toHaveLength(instructorsCounter) // 10 in loop

      users.forEach(user => {
        expect(user._id).toBeDefined()
        expect(user.name).toBeDefined()
        expect(user.name).toBeOfType('string')
        expect(user.name).toHaveLengthGreaterThan(0)
        expect(user.name).toBeOneOf(names)
        expect(user.surname).toBeDefined()
        expect(user.surname).toBeOfType('string')
        expect(user.surname).toHaveLengthGreaterThan(0)
        expect(user.surname).toBeOneOf(surnames)
        expect(user.password).toBeDefined()
        expect(user.password).toBeOfType('string')
        expect(user.password).toHaveLengthGreaterThan(0)
        expect(user.password).toBeOneOf(passwords)
        expect(user.dni).toBeDefined()
        expect(user.dni).toBeOfType('string')
        expect(user.dni).toHaveLengthGreaterThan(0)
        expect(user.dni).toBeOneOf(dnis)
        expect(user.email).toBeDefined()
        expect(user.email).toBeOfType('string')
        expect(user.email).toHaveLengthGreaterThan(0)
        expect(user.email).toBeOneOf(emails)
      })
    })

    it('should fail on unexisting user', async () => {
      let id = '012345678901234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await listUsers(token)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with id ${id} not found`)
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
      id = instructor.id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create 1 practice now
      date = moment()
      let instructorId = id
      let practice = await Practice.create({ date, instructorId, studentId })
      practice.save()

    })

    it('should succeed on correct user', async () => {
      const result = await listUsers(token)
      const { users } = result

      expect(users).toBeDefined()
      expect(users).toHaveLength(1)

      users.forEach(user => {
        expect(user._id).toBeDefined()
        expect(user.name).toBeDefined()
        expect(user.name).toBeOfType('string')
        expect(user.name).toHaveLengthGreaterThan(0)
        expect(user.surname).toBeDefined()
        expect(user.surname).toBeOfType('string')
        expect(user.surname).toHaveLengthGreaterThan(0)
        expect(user.password).toBeDefined()
        expect(user.password).toBeOfType('string')
        expect(user.password).toHaveLengthGreaterThan(0)
        expect(user.dni).toBeDefined()
        expect(user.dni).toBeOfType('string')
        expect(user.dni).toHaveLengthGreaterThan(0)
        expect(user.email).toBeDefined()
        expect(user.email).toBeOfType('string')
        expect(user.email).toHaveLengthGreaterThan(0)
      })
    })
  })

  it('should fail on incorrect id type or content', () => {
    expect(() => listUsers(1)).toThrow(TypeError, '1 is not a string')
    expect(() => listUsers(true)).toThrow(TypeError, 'true is not a string')
    expect(() => listUsers([])).toThrow(TypeError, ' is not a string')
    expect(() => listUsers({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => listUsers(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => listUsers(null)).toThrow(TypeError, 'null is not a string')
    expect(() => listUsers('')).toThrow(ContentError, 'id is empty or blank')
    expect(() => listUsers(' \t\r')).toThrow(ContentError, 'id is empty or blank')
  })

  afterAll(() => Promise.all([User.deleteMany()]).then(database.disconnect))
})
