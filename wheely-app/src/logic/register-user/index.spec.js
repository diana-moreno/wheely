const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const registerUser = require('.')
const { random, floor } = Math
const jwt = require('jsonwebtoken')
const { errors: { ContentError } } = require('wheely-utils')
const { database, models: { User } } = require('wheely-data')

fdescribe('logic - register user', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let roles = ['student', 'admin', 'instructor']
  let name, surname, email, password, role, adminId, dni, token, id

  beforeEach(async () => {
    name = `name-${random()}`
    surname = `surname-${random()}`
    email = `email-${random()}@mail.com`
    password = `password-${random()}`
    dni = `dni-${random()}`
    role = roles[floor(random() * roles.length)]

    await User.deleteMany()

    // create an admin
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

  it('should succeed on correct credentials for common data between users', async () => {
    const response = await registerUser(token, name, surname, email, dni, password, role)
    expect(response).toBeDefined()

    const user = await User.findOne({ email })

    expect(user).toBeDefined()
    expect(user.name).toBe(name)
    expect(user.surname).toBe(surname)
    expect(user.email).toBe(email)
    expect(user.password).toBe(password)
    expect(user.dni).toBe(dni)
    expect(user.role).toBe(role)
  })

  describe('when user is a student', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      role = 'student'

      await User.deleteMany()

      // create an admin
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

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(token, name, surname, email, dni, password, role)

      expect(response).toBeDefined()

      const user = await User.findOne({ email })

      expect(user).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
      expect(user.profile.credits).toBeDefined()
    })
  })

  describe('when user is an instructor', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      role = 'instructor'

      await User.deleteMany()
      // create an admin
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

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(token, name, surname, email, dni, password, role)

      expect(response).toBeDefined()

      const user = await User.findOne({ email })

      expect(user).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
      expect(user.profile.credits).toBe(undefined)
    })
  })

  describe('when user is an admin', () => {
    beforeEach(async () => {
      name = `name-${random()}`
      surname = `surname-${random()}`
      email = `email-${random()}@mail.com`
      password = `password-${random()}`
      dni = `dni-${random()}`
      role = 'admin'

      await User.deleteMany()
      // create an admin
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

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(token, name, surname, email, dni, password, role)

      expect(response).toBeDefined()

      const user = await User.findOne({ email })

      expect(user).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.surname).toBe(surname)
      expect(user.email).toBe(email)
      expect(user.password).toBe(password)
      expect(user.dni).toBe(dni)
      expect(user.role).toBe(role)
      expect(user.profile).toBeDefined()
    })
  })

  describe('when user already exists', () => {
    beforeEach(() => User.create({ name, surname, email, dni, password, role }))

    it('should fail on already existing user', async () => {
      try {
        await registerUser(token, name, surname, email, dni, password, role)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBeDefined()
        expect(typeof error.message).toBe('string')
        expect(error.message.length).toBeGreaterThan(0)
        expect(error.message).toBe(`user with email ${email} already exists`)
      }
    })
  })

  it('should fail on incorrect name, surname, email, dni, password, or expression type and content', () => {
    expect(() => registerUser(1)).toThrow(TypeError, '1 is not a string')
    expect(() => registerUser(true)).toThrow(TypeError, 'true is not a string')
    expect(() => registerUser([])).toThrow(TypeError, ' is not a string')
    expect(() => registerUser({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => registerUser(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => registerUser(null)).toThrow(TypeError, 'null is not a string')

    expect(() => registerUser(token, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => registerUser(token, true)).toThrow(TypeError, 'true is not a string')
    expect(() => registerUser(token, [])).toThrow(TypeError, ' is not a string')
    expect(() => registerUser(token, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => registerUser(token, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => registerUser(token, null)).toThrow(TypeError, 'null is not a string')

    expect(() => registerUser(token, '')).toThrow(ContentError, 'name is empty or blank')
    expect(() => registerUser(token, ' \t\r')).toThrow(ContentError, 'name is empty or blank')

    expect(() => registerUser(token, name, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => registerUser(token, name, true)).toThrow(TypeError, 'true is not a string')
    expect(() => registerUser(token, name, [])).toThrow(TypeError, ' is not a string')
    expect(() => registerUser(token, name, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => registerUser(token, name, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => registerUser(token, name, null)).toThrow(TypeError, 'null is not a string')

    expect(() => registerUser(token, name, '')).toThrow(ContentError, 'surname is empty or blank')
    expect(() => registerUser(token, name, ' \t\r')).toThrow(ContentError, 'surname is empty or blank')

    expect(() => registerUser(token, name, surname, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => registerUser(token, name, surname, true)).toThrow(TypeError, 'true is not a string')
    expect(() => registerUser(token, name, surname, [])).toThrow(TypeError, ' is not a string')
    expect(() => registerUser(token, name, surname, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => registerUser(token, name, surname, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => registerUser(token, name, surname, null)).toThrow(TypeError, 'null is not a string')

    expect(() => registerUser(token, name, surname, '')).toThrow(ContentError, 'e-mail is empty or blank')
    expect(() => registerUser(token, name, surname, ' \t\r')).toThrow(ContentError, 'e-mail is empty or blank')

    expect(() => registerUser(token, name, surname, email, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => registerUser(token, name, surname, email, true)).toThrow(TypeError, 'true is not a string')
    expect(() => registerUser(token, name, surname, email, [])).toThrow(TypeError, ' is not a string')
    expect(() => registerUser(token, name, surname, email, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => registerUser(token, name, surname, email, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => registerUser(token, name, surname, email, null)).toThrow(TypeError, 'null is not a string')

    expect(() => registerUser(token, name, surname, email, dni, '')).toThrow(ContentError, 'password is empty or blank')
    expect(() => registerUser(token, name, surname, email, dni, ' \t\r')).toThrow(ContentError, 'password is empty or blank')
  })

  afterAll(() => User.deleteMany().then(database.disconnect))
})
