const { model } = require('mongoose')
const { user, practice, student, instructor, week, day } = require('./schemas')

module.exports = {
  User: model('User', user),
  Student: model('Student', student),
  Instructor: model('Instructor', instructor),
  Practice: model('Practice', practice),
  Week: model('Week', week),
  Day: model('Day', day)
}
