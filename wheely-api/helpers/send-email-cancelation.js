const { env: { userEmail, passwordEmail } } = process
const nodemailer = require('nodemailer');

module.exports = async function(toStudent, toInstructor, dateEmail, time, instructorName, studentName) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: userEmail,
      pass: passwordEmail
    }
  });

  const emailStudent = {
    from: userEmail,
    to: toStudent,
    subject: 'Your reservation has been canceled',
    html: `<h3>Hello ${studentName},</h3>
          <p>You have recently canceled your booking with the next details: <p>
          <p><b>Date: </b>${dateEmail}</p>
          <p><b>Time: </b>${time}</p>
          <p><b>Instructor: </b>${instructorName}</p>
          <p><b>Where: </b>In your driving school</p>
          <p>Remember that as more frequently you do your practices, nearest you will be to the goal!</p>
          <p>Have a nice day!</p>
          <p>Wheely team</p>
             `
  }

  await transporter.sendMail(emailStudent, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })


  const emailInstructor = {
    from: userEmail,
    to: toInstructor,
    subject: 'Your reservation has been canceled',
    html: `<h3>Hello ${instructorName},</h3>
          <p>We are sorry, but your student has notified 24h in advance and has canceled his practice with you. <p>
          <p><b>Date: </b>${dateEmail}</p>
          <p><b>Time: </b>${time}</p>
          <p><b>Student: </b>${studentName}</p>
          <p><b>Where: </b>In your driving school</p>
          <p>Have a nice day!</p>
          <p>Wheely team</p>`
  }

  await transporter.sendMail(emailInstructor, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}
