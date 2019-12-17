require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const registerUser = require('.')
const { random, floor } = Math
const { errors: { ContentError } } = require('wheely-utils')
const { database, models: { User } } = require('wheely-data')

describe('logic - register user', () => {
  before(() => database.connect(TEST_DB_URL))

  let roles = ['student', 'admin', 'instructor']
  let name, surname, email, password, role, adminId, dni

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
    adminId = admin.id
    admin.save()
  })

  it('should succeed on correct credentials for common data between users', async () => {
    const response = await registerUser(adminId, name, surname, email, dni, password, role)
    expect(response).to.be.undefined

    const user = await User.findOne({ email })

    expect(user).to.exist
    expect(user.name).to.equal(name)
    expect(user.surname).to.equal(surname)
    expect(user.email).to.equal(email)
    expect(user.password).to.equal(password)
    expect(user.dni).to.equal(dni)
    expect(user.role).to.equal(role)
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
      admin.save()
      adminId = admin.id
    })

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(adminId, name, surname, email, dni, password, role)

      expect(response).to.be.undefined

      const user = await User.findOne({ email })

      expect(user).to.exist
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile).to.exist
      expect(user.profile.credits).to.exist
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
      adminId = admin.id
      admin.save()
    })

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(adminId, name, surname, email, dni, password, role)

      expect(response).to.be.undefined

      const user = await User.findOne({ email })

      expect(user).to.exist
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile).to.exist
      expect(user.profile.credits).to.equal(undefined)
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
      adminId = admin.id
      admin.save()
    })

    it('should succeed on correct credentials ', async () => {
      const response = await registerUser(adminId, name, surname, email, dni, password, role)

      expect(response).to.be.undefined

      const user = await User.findOne({ email })

      expect(user).to.exist
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile).to.exist
    })
  })

  describe('when user already exists', () => {
    beforeEach(() => User.create({ name, surname, email, dni, password, role }))

    it('should fail on already existing user', async () => {
      try {
        await registerUser(adminId, name, surname, email, dni, password, role)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error.message).to.exist
        expect(typeof error.message).to.equal('string')
        expect(error.message.length).to.be.greaterThan(0)
        expect(error.message).to.equal(`user with email ${email} already exists`)
      }
    })
  })

  it('should fail on incorrect name, surname, email, dni, password, or expression type and content', () => {
    expect(() => registerUser('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => registerUser(1)).to.throw(TypeError, '1 is not a string')
    expect(() => registerUser(true)).to.throw(TypeError, 'true is not a string')
    expect(() => registerUser([])).to.throw(TypeError, ' is not a string')
    expect(() => registerUser({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => registerUser(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => registerUser(null)).to.throw(TypeError, 'null is not a string')

    expect(() => registerUser(adminId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => registerUser(adminId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => registerUser(adminId, [])).to.throw(TypeError, ' is not a string')
    expect(() => registerUser(adminId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => registerUser(adminId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => registerUser(adminId, null)).to.throw(TypeError, 'null is not a string')

    expect(() => registerUser(adminId, '')).to.throw(ContentError, 'name is empty or blank')
    expect(() => registerUser(adminId, ' \t\r')).to.throw(ContentError, 'name is empty or blank')

    expect(() => registerUser(adminId, name, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => registerUser(adminId, name, true)).to.throw(TypeError, 'true is not a string')
    expect(() => registerUser(adminId, name, [])).to.throw(TypeError, ' is not a string')
    expect(() => registerUser(adminId, name, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => registerUser(adminId, name, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => registerUser(adminId, name, null)).to.throw(TypeError, 'null is not a string')

    expect(() => registerUser(adminId, name, '')).to.throw(ContentError, 'surname is empty or blank')
    expect(() => registerUser(adminId, name, ' \t\r')).to.throw(ContentError, 'surname is empty or blank')

    expect(() => registerUser(adminId, name, surname, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => registerUser(adminId, name, surname, true)).to.throw(TypeError, 'true is not a string')
    expect(() => registerUser(adminId, name, surname, [])).to.throw(TypeError, ' is not a string')
    expect(() => registerUser(adminId, name, surname, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => registerUser(adminId, name, surname, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => registerUser(adminId, name, surname, null)).to.throw(TypeError, 'null is not a string')

    expect(() => registerUser(adminId, name, surname, '')).to.throw(ContentError, 'e-mail is empty or blank')
    expect(() => registerUser(adminId, name, surname, ' \t\r')).to.throw(ContentError, 'e-mail is empty or blank')

    expect(() => registerUser(adminId, name, surname, email, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => registerUser(adminId, name, surname, email, true)).to.throw(TypeError, 'true is not a string')
    expect(() => registerUser(adminId, name, surname, email, [])).to.throw(TypeError, ' is not a string')
    expect(() => registerUser(adminId, name, surname, email, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => registerUser(adminId, name, surname, email, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => registerUser(adminId, name, surname, email, null)).to.throw(TypeError, 'null is not a string')

    expect(() => registerUser(adminId, name, surname, email, dni, '')).to.throw(ContentError, 'password is empty or blank')
    expect(() => registerUser(adminId, name, surname, email, dni, ' \t\r')).to.throw(ContentError, 'password is empty or blank')
  })

  after(() => User.deleteMany().then(database.disconnect))
})
