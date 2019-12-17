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
    subject: 'Your reservation is confirmed',
    html: `<h3>Hello ${studentName},</h3>
          <p>This is a quick email to say we have received your reservation. Here the details: <p>
          <p><b>Date: </b>${dateEmail}</p>
          <p><b>Time: </b>${time}</p>
          <p><b>Instructor: </b>${instructorName}</p>
          <p><b>Where: </b>In your driving school</p>
          <p>Remember to wear addecuated shoes that day and try to be on time.<p>
          <p>You can cancel your practice within 24h, after this time, it won't be possible to be canceled.</p>
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
    subject: 'You have a new reservation!',
    html: `<h3>Hello ${instructorName},</h3>
          <p>This is a quick email to say a student has booked a practice with you. Here the details: <p>
          <p><b>Date: </b>${dateEmail}</p>
          <p><b>Time: </b>${time}</p>
          <p><b>Student: </b>${studentName}</p>
          <p><b>Where: </b>In your driving school</p>
          <p>Remember to write an accourate feedback and a valoration to your student to complete the practice.<p>
          <p>The student can cancel this reservation within 24h, after this time, it won't be possible to be canceled.</p>
          <p>Have a nice day!</p>
          <p>Wheely team</p>
             `
  }

  await transporter.sendMail(emailInstructor, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}
