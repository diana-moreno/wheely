const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const { random } = Math
const editUser = require('.')
const jwt = require('jsonwebtoken')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('wheely-utils')
const { ObjectId, database, models: { User, Student, Instructor } } = require('wheely-data')

describe('logic - edit user', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let id, name, surname, email, password, dni, role, token, newName, newSurname, newEmail, newDni, newCredits

  describe('when user is a student', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, password, dni, role })
      id = user.id
      user.profile = new Student()
      await user.save()
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on edit email and correct password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(id)

      expect(user).toBeDefined()
      expect(user.id).toBe(id)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(newEmail)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
      expect(user.profile.credits).toBe(0)
    })

    it('should fail on incorrect password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      password = '56789'

      try {
        await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(ConflictError)
        expect(error.message).toBe(`password incorrect`)
      }
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      const id = '012345678901234567890123'
      try {
        await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${id} not found`)
      }
    })
  })

  describe('when user is an instructor', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'instructor'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, password, dni, role })
      user.profile = new Instructor()
      await user.save()

      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on edit email and correct password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(id)

      expect(user).toBeDefined()
      expect(user.id).toBe(id)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(newEmail)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
    })

    it('should fail on incorrect password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      password = '56789'

      try {
        await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(ConflictError)
        expect(error.message).toBe(`password incorrect`)
      }
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      const id = '012345678901234567890123'
      try {
        await editUser(token, id, newName, newSurname, newEmail, newDni, newCredits, password)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${id} not found`)
      }
    })
  })

  describe('when user is an admin editing a student', () => {
    let studentId, newName, newSurname, newDni, newCredits, newEmail

    beforeEach(async () => {
      // create admin
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'admin'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, dni, password, role })
      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create and student
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      const student = await User.create({ name, surname, email, dni, password, role })
      studentId = student.id

    })

    it('should succeed on edit name and correct user id', async () => {
      newName = `name-${random()}`
      newSurname = undefined
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).toBeDefined()
      expect(user.id).toBe(studentId)
      expect(user.name).toBe(newName)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit surname and correct user id', async () => {
      newName = undefined
      newSurname = `surname-${random()}`
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).toBeDefined()
      expect(user.id).toBe(studentId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(newSurname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit email and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).toBeDefined()
      expect(user.id).toBe(studentId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(newEmail)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit dni and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = `dni-${random()}`
      newCredits = undefined

      await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).toBeDefined()
      expect(user.id).toBe(studentId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(newDni)
      expect(user.role).toBe(role)
    })

    it('should succeed on adding credits to a student and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = undefined
      newCredits = 5

      await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).toBeDefined()
      expect(user.id).toBe(studentId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile.credits).toBe(newCredits)
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      studentId = '012345678901234567890123'
      try {
        await editUser(token, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(studentId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${studentId} not found`)
      }
    })
  })

  describe('when user is an admin editing a instructor', () => {
    let instructorId, newName, newSurname, newDni, newCredits, newEmail

    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'admin'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, dni, password, role })
      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)

      // create and student
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'instructor'

      const instructor = await User.create({ name, surname, email, dni, password, role })
      instructorId = instructor.id

    })

    it('should succeed on edit name and correct user id', async () => {
      newName = `name-${random()}`
      newSurname = undefined
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(token, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).toBeDefined()
      expect(user.id).toBe(instructorId)
      expect(user.name).toBe(newName)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit surname and correct user id', async () => {
      newName = undefined
      newSurname = `surname-${random()}`
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(token, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).toBeDefined()
      expect(user.id).toBe(instructorId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(newSurname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit email and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(token, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).toBeDefined()
      expect(user.id).toBe(instructorId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(newEmail)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
    })

    it('should succeed on edit dni and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = `dni-${random()}`
      newCredits = undefined

      await editUser(token, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).toBeDefined()
      expect(user.id).toBe(instructorId)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(newDni)
      expect(user.role).toBe(role)
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      instructorId = '012345678901234567890123'
      try {
        await editUser(token, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(instructorId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${instructorId} not found`)
      }
    })
  })

  it('should fail on incorrect id type or content', () => {
    expect(() => editUser(1)).toThrow(TypeError, '1 is not a string')
    expect(() => editUser(true)).toThrow(TypeError, 'true is not a string')
    expect(() => editUser([])).toThrow(TypeError, ' is not a string')
    expect(() => editUser({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => editUser(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => editUser(null)).toThrow(TypeError, 'null is not a string')
    expect(() => editUser('')).toThrow(ContentError, 'id is empty or blank')
    expect(() => editUser(' \t\r')).toThrow(ContentError, 'id is empty or blank')
  })

  afterAll(() => User.deleteMany().then(database.disconnect))
})
