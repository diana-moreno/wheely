import React, { useState, useEffect } from 'react'
import './index.sass'
import Feedback from '../Feedback'
import moment from 'moment'
import logic from '../../logic'
const { listUsers, retrieveUser, listPractices, createPractice } = logic
/*const moment = require('moment')*/

export default function({ onBack }) {
  const [instructors, setInstructors] = useState()
  const [calendar, setCalendar] = useState()
  const [indexDay, setIndexDay] = useState()
  const [notification, setNotification] = useState(null)

  const { token } = sessionStorage

  useEffect(() => {
    (async () => {
      try {
        // list all instructors
        let result = await listUsers(token)
        const { users } = result
        setInstructors(users)
      } catch ({ message }) {
        setNotification({ error: true, message })
      }
    })()
  }, [token])

  const generateAvailableCalendar = async (event) => {
    // prepare empty calendar
    setCalendar([])
    setIndexDay(undefined)
    let id = event.target.value
    let schedule = await getAvailableSchedule(id)
    let calendar = generateCalendar(schedule)
    let reservations = await retrieveReservations(id)
    let availableCalendar = getAvailableCalendar(calendar, reservations)
    setCalendar(availableCalendar)
  }

  // retrieve choosed instructor schedule
  const getAvailableSchedule = async (id) => {
    try {
      let result = await retrieveUser(token, id)
      const { user: { profile: { schedule: { days }}} } = result
      return days
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  // transform schedule in a object with specific dates and times
  const generateCalendar = (schedule) => {
    let calendar = []
    if (typeof schedule === undefined) return calendar

    const daysInAdvance = 30
    for (let i = 0; i < daysInAdvance; i++) {
      const weekday = moment().add(i, 'day').day()
      const today = Number(moment().day())

      if (schedule && schedule[weekday].hours.length > 0) {
        let day = moment().day(i + today, 'day').format('DD-MM-YYYY')
        const hours = schedule[weekday].hours
        calendar.push({ day, hours })
      }
    }
    calendar = checkPastTime(calendar)
    return calendar
  }

  // checks if the first day of the array is today. If is today, removes from the array of hours, the hours that are past (to no offer a new practice in the past)
  const checkPastTime = (calendar) => {

    if (calendar.length && calendar[0].day === moment().format('DD-MM-YYYY')) {
      let timeNow = moment().format('HH:mm')
      timeNow = moment(timeNow, 'HH:mm') //parse string to moment hour
      let timePending = []

      calendar[0].hours.forEach(hour => {
        const timeAvailable = moment(hour, 'HH:mm') //parse string to moment hour

        if (timeNow < timeAvailable) {
          timePending.push(moment(timeAvailable).format('HH:mm'))
        }
      })
      // update today hours
      calendar[0].hours = timePending
    }
    return calendar
  }

// retrieve the instructor reservation
  const retrieveReservations = async (id) => {
    let reservations = []
    try {
      let result = await listPractices(token, id)
      const { practices } = result
      practices.forEach(practice => {
        const [day, hour] = moment(practice.date)
          .format('DD-MM-YYYY HH:mm')
          .split(' ')
        reservations.push({ day, hour })
      })
      return reservations
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  // generates the calendar as a result of subtracting reservations to instructor availability
  const getAvailableCalendar = (calendar, reservations) => {
    reservations && reservations.forEach(reservation =>
      calendar.forEach(date => {
        if(reservation.day === date.day) {
          let index = date.hours.indexOf(reservation.hour)
          index >= 0 && date.hours.splice(index, 1)
        }
    }
  ))
  // clean empty days
  return calendar.filter(day => day.hours.length > 0)
 }

  // save the position in the array of days, of the day selected by the user
  const selectData = (event) => {
    const indexDay = event.target.value
    setIndexDay(indexDay)
  }

  // prepare all data from submit form
  const handleSubmit = (event) => {
    event.preventDefault()

    const { instructor: {value: instructorId}, day: { value: indexDay }, hour: { value: hour } } = event.target

    const day = calendar[indexDay].day
    const dateTime = moment(`${day} ${hour}`, 'DD-MM-YYYY HH:mm')
    handleReservatePractice(instructorId, dateTime)
  }

  // reservate a practice and show a notification
  const handleReservatePractice = async (instructorId, dateTime) => {
    try {
      await createPractice(token, instructorId, dateTime)
      setNotification({ error: false, message: 'You have successfully booked!' })
    } catch ({ message }) {
      setNotification({ error: true, message })
    }
  }

  return <>
    <div className='title'>
      <i onClick={() => onBack()} className='material-icons'>undo</i>
      <h3>Booking</h3>
    </div>
    <section className='booking'>
      <div>
        <h3>Do you want to book a practice?</h3>
        <p>You can select the instructor you prefer and the day and time that suits you best!</p>
        <p>Every practice costs 1 credit.</p>
      </div>
      <form onSubmit={handleSubmit} >
       <select name='instructor' onChange={generateAvailableCalendar} >
          <option value='' >-- instructor --</option>
         { instructors && instructors.map(({ name, surname, _id }, i) =>
            <option name='instructor' key={i} value={_id}>
              {name} {surname}
            </option>
           )
         }
        </select>
       <select name='day' onChange={selectData} >
          <option value=''>-- date --</option>
         { calendar && calendar.sort().map(({ day }, i) =>
            <option name='day' key={i} value={i}>
              {day}
            </option>
          )
         }
        </select>
       <select name='hour'>
          <option value=''>-- time --</option>
         { indexDay && calendar[indexDay].hours.sort().map((hour, i) =>
            <option name='hour' key={i} value={hour}>
              {hour}
            </option>
            )
         }
        </select>
        <button>Confirm</button>
      </form>
      {notification && <Feedback {...notification} />}
    </section>
  </>
}
