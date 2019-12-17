module.exports = {
  registerUser: require('./users/register-user'),
  authenticateUser: require('./users/authenticate-user'),
  retrieveUser: require('./users/retrieve-user'),
  deleteUser: require('./users/delete-user'),
  editUser: require('./users/edit-user'),
  listUsers: require('./users/list-users'),
  createPractice: require('./practices/create-practice'),
  listPractices: require('./practices/list-practices'),
  writeFeedback: require('./practices/write-feedback'),
  cancelPractice: require('./practices/cancel-practice'),
  toggleSchedule: require('./schedule/toggle-schedule'),
  retrievePractice: require('./practices/retrieve-practice')
}
