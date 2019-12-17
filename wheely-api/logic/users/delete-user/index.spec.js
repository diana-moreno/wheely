require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random, floor } = Math
const deleteUser = require('.')
const { errors: { NotFoundError, ContentError } } = require('wheely-utils')
const { database, models: { User, Student, Instructor } } = require('wheely-data')

describe('logic - delete user', () => {
  before(() => database.connect(TEST_DB_URL))

  let roles = ['admin', 'student', 'instructor']
  let name, surname, email, password, role, names, surnames, emails, passwords, ids, adminId, dnis

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
      let currentUser = await User.create(user)
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

  it('should succeed on correct user admin deleting other users', async () => {
    let newArr = ids.map(async (id) => {
      await deleteUser(adminId, id)
    })

    await Promise.all(newArr)

    let noIds = ids.map(async (id) => {
      let user = await User.findOne({ id })
      expect(user).to.equal(null)
    })

    await Promise.all(noIds)
  })

  it('should fail on wrong user id', async () => {
    const fakeId = '012345678901234567890123'
    try {
      await deleteUser(adminId, fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error).to.be.an.instanceOf(NotFoundError)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on wrong admin id', async () => {
    const fakeId = '012345678901234567890123'
    let id = ids[2]
    try {
      await deleteUser(fakeId, id)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error).to.be.an.instanceOf(NotFoundError)
      expect(error.message).to.equal(`user with id ${fakeId} not found`)
    }
  })

  it('should fail on wrong id type', async () => {
    const fakeId = '0123890123'
    try {
      await deleteUser(adminId, fakeId)
      throw Error('should not reach this point')

    } catch (error) {
      expect(error).to.exist
      expect(error).to.be.an.instanceOf(ContentError)
      expect(error.message).to.equal(`${fakeId} is not a valid id`)
    }
  })

  it('should fail on incorrect ids type or content', () => {
    expect(() => deleteUser('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => deleteUser(1)).to.throw(TypeError, '1 is not a string')
    expect(() => deleteUser(true)).to.throw(TypeError, 'true is not a string')
    expect(() => deleteUser([])).to.throw(TypeError, ' is not a string')
    expect(() => deleteUser({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => deleteUser(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => deleteUser(null)).to.throw(TypeError, 'null is not a string')
    expect(() => deleteUser('')).to.throw(ContentError, 'adminId is empty or blank')
    expect(() => deleteUser(' \t\r')).to.throw(ContentError, 'adminId is empty or blank')

    expect(() => deleteUser(adminId, '1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => deleteUser(adminId, 1)).to.throw(TypeError, '1 is not a string')
    expect(() => deleteUser(adminId, true)).to.throw(TypeError, 'true is not a string')
    expect(() => deleteUser(adminId, [])).to.throw(TypeError, ' is not a string')
    expect(() => deleteUser(adminId, {})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => deleteUser(adminId, undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => deleteUser(adminId, null)).to.throw(TypeError, 'null is not a string')
    expect(() => deleteUser(adminId, '')).to.throw(ContentError, 'id is empty or blank')
    expect(() => deleteUser(adminId, ' \t\r')).to.throw(ContentError, 'id is empty or blank')
  })

  after(() => User.deleteMany().then(database.disconnect))
})
