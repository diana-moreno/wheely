const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const jwt = require('jsonwebtoken')
const { random } = Math
const retrieveUser = require('.')
const { errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { database, models: { User, Student, Instructor } } = require('wheely-data')

describe('logic - retrieve user', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let id, name, surname, email, password, role, dni, token

  describe('when user is a student', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'student'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, dni, password, role })
      user.profile = new Student()
      await user.save()

      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on correct user id', async () => {
      const response = await retrieveUser(token, id)
      const { user } = response

      expect(user).toBeDefined()
      expect(user.id).toBe(id)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBeUndefined()
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
      expect(user.profile.credits).toBe(0)
    })

    it('should fail on wrong user id', async () => {
      const id = '012345678901234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await retrieveUser(token, id)
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

      const user = await User.create({ name, surname, email, dni, password, role })
      user.profile = new Instructor()
      await user.save()
      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on correct user id', async () => {
      const response = await retrieveUser(token, id)
      const { user } = response

      expect(user).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBeUndefined()
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
      expect(user.profile.credits).toBe(undefined)
    })

    it('should fail on wrong user id', async () => {
      const id = '012345678901234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await retrieveUser(token, id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${id} not found`)
      }
    })
  })

  describe('when user is an admin', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`,
        role = 'admin'

      await User.deleteMany()

      const user = await User.create({ name, surname, email, dni, password, role })
      id = user.id
      token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on correct user id', async () => {
      const response = await retrieveUser(token, id)
      const { user } = response

      expect(user).toBeDefined()
      expect(user.id).toBe(id)
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBeUndefined()
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBe(undefined)
    })

    it('should fail on wrong user id', async () => {
      const id = '012345678901234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await retrieveUser(token, id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(NotFoundError)
        expect(error.message).toBe(`user with id ${id} not found`)
      }
    })

    it('should fail on incorrect user id', async () => {
      const id = '01234567890123'
      token = jwt.sign({ sub: id }, TEST_SECRET)
      try {
        await retrieveUser(token, id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
/*        expect(error).toBeInstanceOf(ContentError)*/
        expect(error.message).toBe(`${id} is not a valid id`)
      }
    })

    it('should fail on incorrect id type and content', () => {
      expect(() => retrieveUser(1)).toThrow(TypeError, '1 is not a string')
      expect(() => retrieveUser(true)).toThrow(TypeError, 'true is not a string')
      expect(() => retrieveUser([])).toThrow(TypeError, ' is not a string')
      expect(() => retrieveUser({})).toThrow(TypeError, '[object Object] is not a string')
      expect(() => retrieveUser(undefined)).toThrow(TypeError, 'undefined is not a string')
      expect(() => retrieveUser(null)).toThrow(TypeError, 'null is not a string')
    })

  })

  afterAll(() => User.deleteMany().then(database.disconnect))
})
