import React, { useState, useEffect } from 'react';
import './index.sass'
import Feedback from '../Feedback'
import moment from 'moment'
import logic from '../../logic'
const { retrievePractice, writeFeedback } = logic
/*const moment = require('moment')*/

export default function ({ id, onBack }) {
  const { token } = sessionStorage
  const [nameStudent, setNameStudent] = useState()
  const [surnameStudent, setSurnameStudent] = useState()
  const [day, setDay] = useState()
  const [time, setTime] = useState()
  const [instructorId, setInstructorId] = useState()
  const [valoration, setValoration] = useState()
  const [comment, setComment] = useState()
  const [studentId, setStudentId] = useState()
  const [notification, setNotification] = useState(null)
  const [isValorated, setIsValorated] = useState(false)


  useEffect(() => {
    (async () => {
      try {
        const result = await retrievePractice(token, id)
        const { studentId: { name: nameStudent, surname: surnameStudent, _id: studentId }, date } = result.practice
        let [day, time] = moment(date).format('DD-MM-YYYY HH:mm').split(' ')
        setNameStudent(nameStudent)
        setSurnameStudent(surnameStudent)
        setDay(day)
        setTime(time)
        setInstructorId(instructorId)
        setStudentId(studentId)
      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [])

  const handleValoratePractice = (event) => {
    event.preventDefault()
    try {
      writeFeedback(token, id, studentId, comment, valoration)
      setIsValorated(true)
      setNotification({ error: false, message: 'Thanks for your feedback!' })
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  return <>
    <div className='title'>
      <i onClick={onBack} className='material-icons'>undo</i>
      <h3>Valoration</h3>
    </div>
    <section className='valoration'>
      <div className='valoration__detail-container'>
        <div className='valoration__icon'>
          <i className='material-icons'>create</i>
        </div>
        <div className='valoration__detail'>
          <p><b>Date: </b>{day}</p>
          <p><b>Time: </b>{time}</p>
          <p><b>Student: </b>{nameStudent} {surnameStudent}</p>
        </div>
      </div>
      <form onSubmit={handleValoratePractice} className='valoration__form'>
        <textarea
          className='valoration__message'
          cols='30'
          rows='10'
          placeholder="Please, write an accurate feedback to your student. Keep in mind that once sent, it won't be possible to edit."
          onChange={(event) => { setComment(event.target.value)}}
        >
        </textarea>
        <h4>How was {nameStudent}'s performance?</h4>
        <div className='valoration__puntuation'>
          <label>Bad
            <input
              type='radio'
              value={'bad'}
              onChange={(event) => { setValoration(event.target.value) }}
            />
          </label>
          <label>Regular
            <input
              type='radio'
              value={'regular'}
              onChange={(event) => { setValoration(event.target.value) }}
            />
          </label>
          <label>Good
            <input
              type='radio'
              value={'good'}
              onChange={(event) => { setValoration(event.target.value) }}
            />
          </label>
        </div>
        { !isValorated && <button className='valoration__button'>Send</button>}
      </form>
      <div className='valoration__feedback'>
      {notification && <Feedback {...notification} />}
      </div>
    </section>
  </>
}



