require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const editUser = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('wheely-utils')
const { ObjectId, database, models: { User, Student, Instructor } } = require('wheely-data')

describe('logic - edit user', () => {
  before(() => database.connect(TEST_DB_URL))

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
    })

    it('should succeed on edit email and correct password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(id)

      expect(user).to.exist
      expect(user.id).to.equal(id)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(newEmail)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile).to.exist
      expect(user.profile.credits).to.equal(0)
    })

    it('should fail on incorrect password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      password = '56789'

      try {
        await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(ConflictError)
        expect(error.message).to.equal(`password incorrect`)
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
        await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(NotFoundError)
        expect(error.message).to.equal(`user with id ${id} not found`)
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
    })

    it('should succeed on edit email and correct password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(id)

      expect(user).to.exist
      expect(user.id).to.equal(id)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(newEmail)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile).to.exist
    })

    it('should fail on incorrect password', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      password = '56789'

      try {
        await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(id)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(ConflictError)
        expect(error.message).to.equal(`password incorrect`)
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
        await editUser(id, id, newName, newSurname, newEmail, newDni, newCredits, password)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(NotFoundError)
        expect(error.message).to.equal(`user with id ${id} not found`)
      }
    })
  })

  describe('when user is an admin editing a student', () => {
    let studentId, newName, newSurname, newDni, newCredits, newEmail

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

      await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).to.exist
      expect(user.id).to.equal(studentId)
      expect(user.name).to.equal(newName)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit surname and correct user id', async () => {
      newName = undefined
      newSurname = `surname-${random()}`
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).to.exist
      expect(user.id).to.equal(studentId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(newSurname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit email and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).to.exist
      expect(user.id).to.equal(studentId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(newEmail)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit dni and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = `dni-${random()}`
      newCredits = undefined

      await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).to.exist
      expect(user.id).to.equal(studentId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(newDni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on adding credits to a student and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = undefined
      newCredits = 5

      await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(studentId)

      expect(user).to.exist
      expect(user.id).to.equal(studentId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
      expect(user.profile.credits).to.equal(newCredits)
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      studentId = '012345678901234567890123'
      try {
        await editUser(id, studentId, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(studentId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(NotFoundError)
        expect(error.message).to.equal(`user with id ${studentId} not found`)
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

      await editUser(id, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).to.exist
      expect(user.id).to.equal(instructorId)
      expect(user.name).to.equal(newName)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit surname and correct user id', async () => {
      newName = undefined
      newSurname = `surname-${random()}`
      newEmail = undefined
      newDni = undefined
      newCredits = undefined

      await editUser(id, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).to.exist
      expect(user.id).to.equal(instructorId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(newSurname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit email and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined

      await editUser(id, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).to.exist
      expect(user.id).to.equal(instructorId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(newEmail)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(dni)
      expect(user.role).to.equal(role)
    })

    it('should succeed on edit dni and correct user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = undefined
      newDni = `dni-${random()}`
      newCredits = undefined

      await editUser(id, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
      const user = await User.findById(instructorId)

      expect(user).to.exist
      expect(user.id).to.equal(instructorId)
      expect(user.name).to.equal(name)
      expect(user.surname).to.equal(surname)
      expect(user.email).to.equal(email)
      expect(user.password).to.equal(password)
      expect(user.dni).to.equal(newDni)
      expect(user.role).to.equal(role)
    })

    it('should fail on wrong user id', async () => {
      newName = undefined
      newSurname = undefined
      newEmail = `email-${random()}@mail.com`
      newDni = undefined
      newCredits = undefined
      instructorId = '012345678901234567890123'
      try {
        await editUser(id, instructorId, newName, newSurname, newEmail, newDni, newCredits, password)
        const user = await User.findById(instructorId)
        throw Error('should not reach this point')

      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceOf(NotFoundError)
        expect(error.message).to.equal(`user with id ${instructorId} not found`)
      }
    })
  })

  it('should fail on incorrect id type or content', () => {
    expect(() => editUser('1')).to.throw(ContentError, '1 is not a valid id')
    expect(() => editUser(1)).to.throw(TypeError, '1 is not a string')
    expect(() => editUser(true)).to.throw(TypeError, 'true is not a string')
    expect(() => editUser([])).to.throw(TypeError, ' is not a string')
    expect(() => editUser({})).to.throw(TypeError, '[object Object] is not a string')
    expect(() => editUser(undefined)).to.throw(TypeError, 'undefined is not a string')
    expect(() => editUser(null)).to.throw(TypeError, 'null is not a string')
    expect(() => editUser('')).to.throw(ContentError, 'id is empty or blank')
    expect(() => editUser(' \t\r')).to.throw(ContentError, 'id is empty or blank')
  })

  after(() => User.deleteMany().then(database.disconnect))
})
