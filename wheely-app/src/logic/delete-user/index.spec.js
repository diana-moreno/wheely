require('dotenv').config()
const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const { random, floor } = Math
const jwt = require('jsonwebtoken')
const deleteUser = require('.')
const { errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { database, models: { User, Student, Instructor } } = require('wheely-data')

describe('logic - delete user', () => {
  beforeAll(() => database.connect(TEST_DB_URL))

  let roles = ['admin', 'student', 'instructor']
  let name, surname, email, password, role, names, surnames, emails, passwords, ids, token, dnis

  beforeEach(async () => {
    await Promise.all([User.deleteMany()])

    ids = []
    names = []
    surnames = []
    emails = []
    passwords = []
    emails = []
    dnis = []
    const insertions = []

    for (let i = 0; i < 10; i++) {
      const user = {
        name: `name-${random()}`,
        surname: `surname-${random()}`,
        email: `email-${random()}@mail.com`,
        password: `password-${random()}`,
        dni: `dni-${random()}`,
        role: roles[floor(random() * 3)]
      }
      const currentUser = await User.create(user)
      insertions.push(currentUser)
      names.push(currentUser.name)
      surnames.push(currentUser.surname)
      emails.push(currentUser.email)
      passwords.push(currentUser.password)
      dnis.push(currentUser.dni)
      ids.push(currentUser._id.toString())
    }
    await Promise.all(insertions)

    //create an admin who wants to delete the other users
    const admin = await User.create({
      name: `name-${random()}`,
      surname: `surname-${random()}`,
      email: `email-${random()}@mail.com`,
      password: `password-${random()}`,
      dni: `dni-${random()}`,
      role: 'admin'
    })
    const id = admin.id
    token = jwt.sign({ sub: id }, TEST_SECRET)
  })

  it('should succeed on correct user admin deleting other users', async () => {

    const newArr = ids.map(async (id) => {
      await deleteUser(token, id)
    })

    await Promise.all(newArr)

    const noIds = ids.map(async (id) => {
      const user = await User.findOne({ id })
      expect(user).toBe(null)
    })

    await Promise.all(noIds)
  })

  it('should fail on wrong user id', async () => {
    const fakeId = '012345678901234567890123'
    try {
      await deleteUser(token, fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.message).toBe(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on wrong admin id', async () => {
    const id = '012345678901234567890123'
    const token = jwt.sign({ sub: id }, TEST_SECRET)
    const userId = ids[0]
    try {
      await deleteUser(token, userId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.message).toBe(`user with id ${id} not found`)
    }
  })

  it('should fail on wrong id type', async () => {
    const fakeId = '0123890123'
    try {
      await deleteUser(token, fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).toBeDefined()
/*      expect(error).toBeInstanceOf(ContentError)*/
      expect(error.message).toBe(`${fakeId} is not a valid id`)
    }
  })

  it('should fail on incorrect ids type or content', () => {
    expect(() => deleteUser(1)).toThrow(TypeError, '1 is not a string')
    expect(() => deleteUser(true)).toThrow(TypeError, 'true is not a string')
    expect(() => deleteUser([])).toThrow(TypeError, ' is not a string')
    expect(() => deleteUser({})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => deleteUser(undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => deleteUser(null)).toThrow(TypeError, 'null is not a string')
    expect(() => deleteUser('')).toThrow(ContentError, 'adminId is empty or blank')
    expect(() => deleteUser(' \t\r')).toThrow(ContentError, 'adminId is empty or blank')

    expect(() => deleteUser(token, 1)).toThrow(TypeError, '1 is not a string')
    expect(() => deleteUser(token, true)).toThrow(TypeError, 'true is not a string')
    expect(() => deleteUser(token, [])).toThrow(TypeError, ' is not a string')
    expect(() => deleteUser(token, {})).toThrow(TypeError, '[object Object] is not a string')
    expect(() => deleteUser(token, undefined)).toThrow(TypeError, 'undefined is not a string')
    expect(() => deleteUser(token, null)).toThrow(TypeError, 'null is not a string')
    expect(() => deleteUser(token, '')).toThrow(ContentError, 'id is empty or blank')
    expect(() => deleteUser(token, ' \t\r')).toThrow(ContentError, 'id is empty or blank')
  })

  afterAll(() => User.deleteMany().then(database.disconnect))
})
