import React, { useContext } from 'react';
import { withRouter } from 'react-router-dom'
import Context from '../CreateContext'
import './index.sass'
/*const moment = require('moment')*/
import moment from 'moment'

export default withRouter(function({ history, practice, role }) {
  const { roleOwner } = useContext(Context)

  const { instructorId: { name: nameInstructor, surname: surnameInstructor }, studentId: { name: nameStudent, surname: surnameStudent }, _id, status, date } = practice
  const [day, hour] = moment(date).format('DD-MM-YYYY HH:mm').split(' ')

  // depending on if is a student or a instructor who select a reservation, is redirecting to one place or another
  const handleDetail = () => {
    if(roleOwner === 'student' && status === 'pending') {
      history.push(`/reservation-detail/${_id}`)
    } else if(roleOwner === 'instructor' && status === 'feedback') {
      history.push(`/valoration/${_id}`)
    }
  }

  return <>
    <li className={`reservation reservation--${status}`} onClick={handleDetail} >
      <div className='reservation__icon'>
        { status === 'pending' &&
          <i className='material-icons'>hourglass_empty</i>
        }
        { status === 'feedback' && roleOwner === 'instructor' &&
          <i className='material-icons'>create</i>
        }
      </div>
      <div className='reservation__detail'>
        <p><b>Date: </b>{day}</p>
        <p><b>Time: </b>{hour}</p>
        { role === 'student'
          ? <p><b>Instructor: </b>{nameInstructor} {surnameInstructor}</p>
          : <p><b>Student: </b>{nameStudent} {surnameStudent}</p>
        }
        <p><b>Status: </b>{status}</p>
      </div>
    </li>
  </>
})
